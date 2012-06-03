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
     
    #print zip(*matrix)[4]
    matrix = zip(*matrix)
    stops = matrix[1][1:]
    trains = matrix[2:-2]
    trainList = []

    #print stops
    #print trains

    for train in trains:
        #tTemp = {}
        #tTemp['number'] = train[0]
        #tTemp['stops'] = dict(zip(stops,train[1:]))
        trainList.append(dict(number = train[0],
                                stops = dict(zip(stops,train[1:]))
        ))
            
    print '\n\n', trainList[0]    
    #print trainList

    for train in trainList:
        for (k, v) in train['stops'].iteritems():
            if v != '-':
                if train['number'] in ['146', '150', '154', '158', '260', '362',  '264', '266', '368', '270', '372', '274', '276', '378', '280', '382', '284', '386', '288', '190', '192', '194'] or (train['number'] == '142' & v.startswith('12')) or (train['number'] == '196' & !v.startswith('12')):
                    train['stops'][k] += 'p'
       
    print '\n\n', trainList[20]    

if __name__ == '__main__':
    main()
