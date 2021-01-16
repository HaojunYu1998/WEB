import os
import sys
import argparse
import time
import random
import utils
import pdb
import warnings

import torch
import torch.autograd as autograd
import torch.nn as nn
import torch.functional as F
import torch.optim as optim
import numpy as np

from torch.utils.data import Dataset, DataLoader
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from data import PaddedTensorDataset, TextLoader
from model import LSTMClassifier
from torch.nn.parallel import DistributedDataParallel
from tqdm import tqdm

warnings.filterwarnings("ignore")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--hidden_dim', type=int, default=128,
                        help='hidden dimensions')
    parser.add_argument('--batch_size', type=int, default=4096,
                        help='size for each minibatch')
    parser.add_argument('--num_epochs', type=int, default=100,
                        help='maximum number of epochs')
    parser.add_argument('--embed_dim', type=int, default=128,
                        help='syscall name embedding dimensions')
    parser.add_argument('--learning_rate', type=float, default=0.01,
                        help='initial learning rate')
    parser.add_argument('--weight_decay', type=float, default=1e-4,
                        help='weight_decay rate')
    parser.add_argument('--seed', type=int, default=321,
                        help='seed for random initialisation')
    parser.add_argument('--mile_stones', type=list, default=[50, 80],
                        help='milestones for learning_rate change')
    parser.add_argument('--gamma', type=float, default=0.1,
                        help='gamma for learning_rate change')
    args = parser.parse_args()
    train(args)


def apply(model, criterion, batch, targets):
    pred, loss = model(torch.autograd.Variable(batch), criterion, torch.autograd.Variable(targets))
    loss = loss.mean()
    return pred, loss

def train_model(model, optimizer, scheduler, train, dev, x_to_ix, y_to_ix, batch_size, max_epochs):
    criterion = nn.NLLLoss()
    criterion = criterion.cuda()
    # use gpu to compute criterion
    for epoch in range(max_epochs):
        print('Epoch:', epoch)
        y_true = list()
        y_pred = list()
        total_loss = 0
        train_loader = utils.create_dataset(train, x_to_ix, y_to_ix, batch_size=batch_size)
        pbar = tqdm(enumerate(train_loader), total = len(train_loader))
        for batch_idx, (batch, targets) in pbar:
            model.zero_grad()
            pred, loss = apply(model, criterion, batch.cuda(), targets.cuda())
            loss.backward()
            optimizer.step()
            
            pred_idx = torch.max(pred, 1)[1]
            y_true += list(targets.int()) # fact
            y_pred += list(pred_idx.cpu().data.int()) # prediction
            total_loss += loss * batch_size
        
        acc = accuracy_score(y_true, y_pred)
        val_loss, val_acc = evaluate_validation_set(model, dev, x_to_ix, y_to_ix, criterion)
        scheduler.step()
        print("Train loss: {} - acc: {} \nValidation loss: {} - acc: {}".format(total_loss.data.float()/len(train), acc,
                                                                                val_loss, val_acc))
        if (epoch + 1)%10 == 0:
            torch.save(model, "model_epoch.pth" )

    return model


def evaluate_validation_set(model, devset, x_to_ix, y_to_ix, criterion):
    with torch.no_grad():
        y_true = list()
        y_pred = list()
        total_loss = 0
        for batch, targets in utils.create_dataset(devset, x_to_ix, y_to_ix, batch_size=1):
            # batch, targets, lengths = utils.sort_batch(batch, targets, lengths)
            pred, loss = apply(model, criterion, batch.cuda(), targets.cuda())
            pred_idx = torch.max(pred, 1)[1]
            y_true += list(targets.int())
            y_pred += list(pred_idx.cpu().data.int())
            total_loss += loss
        acc = accuracy_score(y_true, y_pred)

    return total_loss.data.float()/len(devset), acc


def evaluate_test_set(model, test, x_to_ix, y_to_ix):
    with torch.no_grad():
        y_true = list()
        y_pred = list()

        for batch, targets in utils.create_dataset(test, x_to_ix, y_to_ix, batch_size=1):
            # batch, targets, lengths = utils.sort_batch(batch.cuda(), targets.cuda(), lengths.cuda())
            pred = model(torch.autograd.Variable(batch))
            pred_idx = torch.max(pred, 1)[1]
            y_true += list(targets.cpu().int())
            y_pred += list(pred_idx.cpu().data.int())

    print(len(y_true), len(y_pred))
    print(classification_report(y_true, y_pred))
    print(confusion_matrix(y_true, y_pred))


def train(args):
    # limit to special devices
    # os.environ['CUDA_VISIBLE_DEVICES'] = '0,1'

    random.seed(args.seed)
    data_loader = TextLoader()

    train_data = data_loader.train_data
    dev_data = data_loader.dev_data
    test_data = data_loader.test_data

    char_vocab = data_loader.token2id
    tag_vocab = data_loader.tag2id
    char_vocab_size = len(char_vocab)

    print('Training samples:', len(train_data))
    print('Valid samples:', len(dev_data))
    print('Test samples:', len(test_data))

    print("input vector vocab size:", len(char_vocab))
    print(tag_vocab)

    model = LSTMClassifier(vocab_size = char_vocab_size,
                        embedding_dim = args.embed_dim,
                        hidden_dim=args.hidden_dim,
                        classes = len(tag_vocab))

    model = model.cuda()
    model = nn.DataParallel(model, device_ids = [0, 1])

    optimizer = optim.SGD(model.parameters(), lr=args.learning_rate, weight_decay=args.weight_decay)
    # change lr dynamically
    scheduler = optim.lr_scheduler.MultiStepLR(optimizer, milestones=args.mile_stones, gamma=args.gamma)

    model = train_model(model, optimizer, scheduler, train_data, dev_data, char_vocab, tag_vocab, args.batch_size, args.num_epochs)

    evaluate_test_set(model, test_data, char_vocab, tag_vocab)


if __name__ == '__main__':
	main()
