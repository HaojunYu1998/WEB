import torch
import torch.autograd as autograd
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

#torch.backends.cudnn.enabled = False
# to solve "CUDNN_STATUS_EXECUTION_FAILED"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class LSTMClassifier(nn.Module):

	def __init__(self, vocab_size, embedding_dim, hidden_dim, classes):

		super(LSTMClassifier, self).__init__()

		#embedding dim and in_channel num at the same time
		self.embedding_dim = embedding_dim
		self.hidden_dim = hidden_dim
		self.vocab_size = vocab_size

		self.embedding = nn.Embedding(vocab_size, embedding_dim)
		self.lstm = nn.LSTM(embedding_dim, hidden_dim, bidirectional = True)
		self.fc = nn.Linear(hidden_dim * 2, classes)
		self.softmax = nn.LogSoftmax()
		self.dropout_layer = nn.Dropout(p=0.3)


	def init_hidden(self, batch_size):
		return(autograd.Variable(torch.randn(2, batch_size, self.hidden_dim).to(device)),
						autograd.Variable(torch.randn(2, batch_size, self.hidden_dim)).to(device))

	def forward(self, batch, criterion, targets):
		
		self.hidden = self.init_hidden(batch.size(0))
		embed = self.embedding(batch)
		embed = embed.permute(1, 0, 2).contiguous()
		output, (ht, ct) = self.lstm(embed, self.hidden)
		output = self.dropout_layer(torch.cat((ht[0], ht[1]), 1))
		output = self.fc(output)
		output = self.softmax(output)

		loss = criterion(output, targets)

		return output, loss
