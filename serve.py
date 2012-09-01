from flask import Flask, abort
from datetime import date
import parse_cal

app = Flask(__name__)


@app.route('/')
def index():
    with open('index.html') as f:
        s = f.read()
    return s

@app.route('/data/<int:timestamp>/<line>')
def data(timestamp, line):
    d = date.fromtimestamp(timestamp/1000)
    if line == 'north':
        if d.weekday() in [5,6]:
            return parse_cal4.to_json(d, line)
        else:
            return parse_cal3.to_json(d, line)
    elif line == 'south':
        if d.weekday() in [5,6]:
            return parse_cal2.to_json(d, line)
        else:
            return parse_cal.to_json(d, line)
    else:
        abort(404)
        return 'nope'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
