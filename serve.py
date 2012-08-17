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
    if line in ['south','north']:
        d = date.fromtimestamp(timestamp/1000)
        return parse_cal.to_json(d, line)
    else:
        abort(404)
        return 'nope'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
