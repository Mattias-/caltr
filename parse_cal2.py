#! /usr/bin/env python

import sys
import datetime
import json

def main():
    print to_json(datetime.date.today(), 'south')

def to_json(date, line):
    matrix = []
    f = open('south_weekend.txt')
    #firstline = f.readline()
    #columns = firstline.strip().split('\t')
    #matrix.append(columns)
    #temprow = []
    #for line in f:
    #    rowdata = line.strip().split('\t')
    #    if len(rowdata) ==  2:
    #        if temprow:
    #            matrix.append(temprow)
    #            temprow = []
    #    temprow.extend(rowdata)
    #f.close()
    #matrix.append(temprow)
    #matrix = [list(i) for i in zip(*matrix)]
    temprow = []
    for line in f:
        if not line[0].isdigit() and not line[0] == '-' or line.startswith('22nd'):
            matrix.append(temprow)
            temprow = []
        temprow.append(line.strip())

    matrix.append(temprow)
    #print matrix[0]
    #print 'matrix', matrix[1:]
    matrix = [list(i) for i in zip(*matrix[1:])]
    #print 'matrix', matrix

    #zones = matrix[0][1:]
    stops = matrix[0][1:]
    trains = matrix[1:]

    #del trains[22] # remove middle stop column
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
            d = date;

            #if train['number'] in ['196', '150', '154', '158', '260', '362',
            #                       '264', '266', '368', '270', '372', '274',
            #                       '276', '378', '280', '382', '284', '386',
            #                       '288', '190', '192', '194'] or (train['number'] == '198' and h == 12) or (train['number'] == '146' and h == 1):
            #    h = (h + 12) % 24
            #if (train['number'] == '196' and h == 0) or train['number'] == '198':
            #    d += datetime.timedelta(1)
            if train['number'] in ['432','434','436','438','440','442','444',
                                   '444','446','448','450','804'] or (train['number'] in ['802','430'] and h==1) or (train['number'] == '454' and h == 12):
                h = (h + 12) % 24
            if train['number'] == '454':
                d += datetime.timedelta(1)


            t = datetime.time(h, m)
            s['time'] = datetime.datetime.combine(d, t).isoformat() + '-0700'
            #TODO if sunday remove 2 last trains
    #print "trains = %s;" % json.dumps(tl, indent=2)
    #print "stops = %s;" % json.dumps(stops,indent=2)
    o = json.load(open('waypoints_s.json'))
    return {'trains': tl, 'stops':stops, 'waypoints':o}

if __name__ == '__main__':
    main()
