import os
import random
from collections import defaultdict
from torch.utils.data import Dataset, DataLoader

good_file = "goodqueries.txt"
bad_file = "badqueries.txt"

class TextLoader:
    def __init__(self):
        self.token2id = defaultdict(int)

        # prepare data
        self.token_set, data = self.load_data()

        # split data
        self.train_data, self.dev_data, self.test_data = self.split_data(data)

        # token and category vocabulary
        self.token2id = self.set2id(self.token_set)
        self.tag2id = self.set2id(set(data.keys()))
    
    def load_data(self):
        token_set = set()
        data = defaultdict(list)
        token_set.add(" ")
        with open(good_file, "r+") as f:
            for line in f:
                if(len(line) >= 150 or len(line) <= 7):
                    continue
                temp = list(line)
                for c in temp:
                    token_set.add(c)
                data["good"].append(temp)
        with open(bad_file, "r+") as f:
            for line in f:
                if(len(line) >= 150 or len(line) <= 7):
                    continue
                temp = list(line)
                for c in temp:
                    token_set.add(c)
                data["bad"].append(temp)
        
        return token_set, data

    def split_data(self, data):
        """
        Split data into train, dev, and test (currently use 80%/10%/10%)
        It is more make sense to split based on category, but currently it hurts performance
        """
        train_split = []
        dev_split = []
        test_split = []

        print('Data statistics: ')

        all_data = []
        for cat in data:
            cat_data = data[cat]
            print(cat, len(data[cat]))
            all_data += [(dat, cat) for dat in cat_data]

        all_data = random.sample(all_data, len(all_data))

        train_ratio = int(len(all_data) * 0.8)
        dev_ratio = int(len(all_data) * 0.9)

        train_split = all_data[:train_ratio]
        dev_split = all_data[train_ratio:dev_ratio]
        test_split = all_data[dev_ratio:]

        train_cat = set()
        for item, cat in train_split:
            train_cat.add(cat)
        print('Train categories:', sorted(list(train_cat)))

        dev_cat = set()
        for item, cat in dev_split:
            dev_cat.add(cat)
        print('Dev categories:', sorted(list(dev_cat)))

        test_cat = set()
        for item, cat in test_split:
            test_cat.add(cat)
        print('Test categories:', sorted(list(test_cat)))
        

        return train_split, dev_split, test_split

    def set2id(self, item_set):
        item2id = defaultdict(int)
        for item in item_set:
            item2id[item] = len(item2id)

        return item2id


class PaddedTensorDataset(Dataset):
    def __init__(self, data_tensor, target_tensor):
        assert data_tensor.size(0) == target_tensor.size(0)
        self.data_tensor = data_tensor
        self.target_tensor = target_tensor

    def __getitem__(self, index):
        return self.data_tensor[index], self.target_tensor[index]

    def __len__(self):
        return self.data_tensor.size(0)
