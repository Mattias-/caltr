#! /usr/bin/env python

import sys
import datetime
import json

def main():
    print to_json(datetime.date.today(), 'north')

def to_json(date, line):
    matrix = []
    f = open('north2.txt')
    #firstline = f.readline()
    #columns = firstline.strip().split('\t')
    #matrix.append(columns)
    temprow = []
    for line in f:
        rowdata = line.strip().split('\t')
        if len(rowdata) == 2:
            matrix.append(temprow)
            temprow = []
        temprow.extend(rowdata)
    f.close()
    matrix.append(temprow[:48])
    matrix.append(temprow[48:96])
    matrix.append(temprow[96:144])
    #matrix.append(temprow[0].split('\t') + temprow[1].split('\t'))
    #matrix.append(temprow[2].split('\t'))
    matrix = [list(i) for i in zip(*matrix[1:])]
    #print 'matrix', matrix
    zones = matrix[0][:-1]
    stops = matrix[1][:-1]
    trains = matrix[2:-2]
    del trains[23] # remove middle stop column
    trainList = []
    #print 'zones', zones
    #print 'stops', stops
    #print 'trains', trains
    tl=[]
    for trainRow in trains:
        r = {}
        r['number'] = trainRow.pop(len(trainRow)-1).strip('#')
        r['stops'] = []
        for i, time in enumerate(trainRow):
            if time != '-':
                r['stops'].append(dict(time = time, name = stops[i]))
        tl.append(r)
    #print tl

    #for train in trains:
    #    trainList.append(dict(number = train[0],stops = list(train[1:])))

    #print '\n\n', trainList[18]    

    for train in tl:
        for s in train['stops']:
            t = s['time'].strip('*').split(':')
            h = int(t[0])
            m = int(t[1])
            if train['number'] in ['151', '155', '159', '261', '263', '365',
                                   '267', '369', '271', '373', '275', '277',
                                   '379', '281', '383', '285', '287', '189',
                                   '191', '193', '195'] or (train['number'] == '147' and h == 1) or (train['number'] == '197' and h == 12):
                h = (h + 12) % 24
            d = date;
            if (train['number'] == '197' and h == 0):
                d += datetime.timedelta(1);
            t = datetime.time(h, m)
            s['time'] = datetime.datetime.combine(d, t).isoformat() + '-0700'
    #print "trains = %s;" % json.dumps(tl, indent=2)
    #print "stops = %s;" % json.dumps(stops,indent=2)
    return json.dumps({'trains': tl, 'stops':stops}, indent=2)

if __name__ == '__main__':
    main()
