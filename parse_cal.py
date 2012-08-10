#! /usr/bin/env python

import sys
import datetime
import json

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

    matrix = [list(i) for i in zip(*matrix)]
    #print matrix[0]
    #print 'matrix', matrix
    zones = matrix[0][1:]
    stops = matrix[1][1:]
    trains = matrix[2:-2]
    del trains[22] # remove middle stop column
    trainList = []
    #print 'zones', zones
    #print 'stops', stops
    #print 'trains', trains
    tl=[]
    for trainRow in trains:
        r = {}
        r['number'] = trainRow.pop(0)
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
            if train['number'] in ['196', '150', '154', '158', '260', '362',
                                   '264', '266', '368', '270', '372', '274',
                                   '276', '378', '280', '382', '284', '386',
                                   '288', '190', '192', '194'] or (train['number'] == '198' and h == 12) or (train['number'] == '146' and h == 1):
                h = (h + 12) % 24
            d = datetime.date.today()
            t = datetime.time(h, m)
            s['time'] = datetime.datetime.combine(d, t).isoformat() + '-0700'
    print "trains = %s;" % json.dumps(tl, indent=2)
    print "stops = %s;" % json.dumps(stops,indent=2)

#    for train in trainList:
#        for (k, v) in enumerate(train['stops']):
#            if v.endswith('*'):
#                train['stops'][k] = v[:-1]
#            if (v != '-' and
#            (train['number'] in ['146', '150', '154', '158', '260', '362', '264', '266', '368', '270', '372', '274', '276', '378', '280', '382', '284', '386', '288', '190', '192', '194']
#            or ((train['number'] == '142' and v.startswith('12'))
#            or (train['number'] == '196' and not v.startswith('12'))))
#            ):
#                    train['stops'][k] += 'p'
#    for train in trainList:
#        for (i, time) in enumerate(train['stopTimes']):
#            split = time.split(':')
#            h = int(split[0])
#            m = split[1]
#            pm = len(split[1]) == 3
#            if pm and h != 12:
#                h += 12
#                m = m[:-1]
#            if not pm and h == 12: h = 0
#            m = int(m)
#            del train['trainNumber'][i]
#            train['trainNumber'][i] = (h,m)


    #print '\n\n', trainList[18]    
    #print '\n\n', trainList[42]    
    #print 'trainList =', trainList, ';'
    #print 'stopList =', list(stops), ';'

if __name__ == '__main__':
    main()
