#! /usr/local/bin/python

import sys

def main():
    matrix = []
    firstline = sys.stdin.readline()
    columns = firstline.strip().split('\t')
    matrix.append(columns)
    
    temprow = []
    for line in sys.stdin:
        rowdata = line.strip().split('\t')
        if len(rowdata) ==  2:
            if temprow:
                matrix.append(temprow)
                temprow = []
        temprow.extend(rowdata)
    
    matrix.append(temprow)
     
    matrix = zip(*matrix)
    stops = matrix[1][1:]
    trains = matrix[2:-2]
    del trains[22] # remove middle stop column
    trainList = []

    #print stops
    #print trains

    for train in trains:
        trainList.append(dict(trainNumber = train[0],stopTimes = list(train[1:])))
           
    #print '\n\n', trainList[18]    
    #print trainList

    for train in trainList:
        for (k, v) in enumerate(train['stopTimes']):
            if v.endswith('*'):
                train['stopTimes'][k] = v[:-1]
            if (v != '-' and 
            (train['trainNumber'] in ['146', '150', '154', '158', '260', '362', '264', '266', '368', '270', '372', '274', '276', '378', '280', '382', '284', '386', '288', '190', '192', '194']
            or ((train['trainNumber'] == '142' and v.startswith('12')) 
            or (train['trainNumber'] == '196' and not v.startswith('12'))))
            ):
                    train['stopTimes'][k] += 'p'
       
    #print '\n\n', trainList[18]    
    #print '\n\n', trainList[42]    
    print 'trainList =', trainList, ';'
    print 'stopList =', list(stops), ';'

if __name__ == '__main__':
    main()
