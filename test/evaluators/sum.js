var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var helpers = require('../helpers');

var firebaseServer;
var client;
var reporting;

beforeEach(() => {
  firebaseServer = helpers.newFirebaseServer();
  client = helpers.newFirebaseClient();
  reporting = new helpers.FirebaseReporting({
    firebase: helpers.newFirebaseClient()
  });
});

afterEach(() => {
  if (firebaseServer) {
    firebaseServer.close();
    firebaseServer = null;
  }
});

describe('evaluator', () => {
  it('should store correct metric for single data point', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = {value: 50};

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').select(1)).to.become([50])
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should store correct metric for multiple data points', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50}, {value: 2}, {value: 5}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').select(1)).to.become([57])
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('value', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = {value: 50};

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').value()).to.become(50)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = {value: 50, mode: 1};

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom', { mode: 1 }).sum('value').value()).to.become(50),
        expect(reporting.filter('custom', { mode: 2 }).sum('value').value()).to.become(null)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('select', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = {value: 50};

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').select(1)).to.become([50])
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = {value: 50, mode: 1};

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom').sum('value').select(1)).to.become([50])
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('count', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50},{value: 2},{value: 5}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').count()).to.become(1)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50, mode: 1},{value: 2, mode: 2},{value: 5, mode: 3}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom').sum('value').count()).to.become(3)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('lesser', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50},{value: 2},{value: 5}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').lesser(5).count()).to.become(0),
        expect(reporting.filter().sum('value').lesser(60).count()).to.become(1)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50, mode: 1},{value: 2, mode: 2},{value: 5, mode: 1}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom').sum('value').lesser(1).count()).to.become(0),
        expect(reporting.filter('custom').sum('value').lesser(50).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').lesser(60).count()).to.become(2)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('greater', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50},{value: 2},{value: 5}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').greater(55).count()).to.become(1),
        expect(reporting.filter().sum('value').greater(60).count()).to.become(0)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50, mode: 1},{value: 2, mode: 2},{value: 5, mode: 1}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom').sum('value').greater(50).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').greater(5).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').greater(0).count()).to.become(2)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('equal', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50},{value: 2},{value: 5}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').equal(2).count()).to.become(0),
        expect(reporting.filter().sum('value').equal(5).count()).to.become(0),
        expect(reporting.filter().sum('value').equal(55).count()).to.become(0),
        expect(reporting.filter().sum('value').equal(57).count()).to.become(1)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50, mode: 1},{value: 2, mode: 2},{value: 5, mode: 1}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom').sum('value').equal(50).count()).to.become(0),
        expect(reporting.filter('custom').sum('value').equal(2).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').equal(55).count()).to.become(1)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('between', () => {
  it('should retrieve metric with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50},{value: 2},{value: 5}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').between(0, 5).count()).to.become(0),
        expect(reporting.filter().sum('value').between(10, 60).count()).to.become(1)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metric with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    const data = [{value: 50, mode: 1},{value: 2, mode: 2},{value: 5, mode: 1}];

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom').sum('value').between(10, 50).count()).to.become(0),
        expect(reporting.filter('custom').sum('value').between(0, 50).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').between(1, 5).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').between(1, 2).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').between(10, 60).count()).to.become(1),
        expect(reporting.filter('custom').sum('value').between(0, 55).count()).to.become(2)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});

describe('during', () => {
  it('should retrieve metrics with default filter', (done) => {
    reporting.addMetric('value', ['sum']);
    reporting.enableRetainer('minute', 'value', ['sum']);
    reporting.enableRetainer('second', 'value', ['sum']);
    const data = [{value: 50},{value: 2},{value: 5}];
    const start = new Date().getTime() - 1000*60*60;
    const end = new Date().getTime() + 1000*60*60;
    const bucketsecond = reporting.getEmptyBuckets('second', start, end);
    bucketsecond[reporting.getRetainerBucketKey('second')] = 57;
    const bucketminute = reporting.getEmptyBuckets('minute', start, end);
    bucketminute[reporting.getRetainerBucketKey('minute')] = 57;

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter().sum('value').during('minute').range(start, end).valuesAsObject(true)).to.become(bucketminute),
        expect(reporting.filter().sum('value').during('second').range(start, end).valuesAsObject(true)).to.become(bucketsecond)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metrics with custom filter', (done) => {
    reporting.addFilter('custom', ['mode']);
    reporting.addMetric('value', ['sum']);
    reporting.enableRetainer('minute', 'value', ['sum']);
    reporting.enableRetainer('second', 'value', ['sum']);
    const data = [{value: 50, mode: 1},{value: 2, mode: 2},{value: 5, mode: 1}];
    const start = new Date().getTime() - 1000*60*60;
    const end = new Date().getTime() + 1000*60*60;
    const bucketsecond1 = reporting.getEmptyBuckets('second', start, end);
    bucketsecond1[reporting.getRetainerBucketKey('second')] = 55;
    const bucketsecond2 = reporting.getEmptyBuckets('second', start, end);
    bucketsecond2[reporting.getRetainerBucketKey('second')] = 2;
    const bucketminute1 = reporting.getEmptyBuckets('minute', start, end);
    bucketminute1[reporting.getRetainerBucketKey('minute')] = 55;
    const bucketminute2 = reporting.getEmptyBuckets('minute', start, end);
    bucketminute2[reporting.getRetainerBucketKey('minute')] = 2;

    reporting.saveMetrics(data).then(() => {
      expect(Promise.all([
        expect(reporting.filter('custom', { mode: 1 }).sum('value').during('minute').range(start, end).valuesAsObject(true)).to.become(bucketminute1),
        expect(reporting.filter('custom', { mode: 2 }).sum('value').during('minute').range(start, end).valuesAsObject(true)).to.become(bucketminute2),
        expect(reporting.filter('custom', { mode: 1 }).sum('value').during('second').range(start, end).valuesAsObject(true)).to.become(bucketsecond1),
        expect(reporting.filter('custom', { mode: 2 }).sum('value').during('second').range(start, end).valuesAsObject(true)).to.become(bucketsecond2)
      ])).notify(done);
    }).catch((err) => {
      done(new Error(err));
    });
  });

  it('should retrieve metrics across time gaps', (done) => {
    reporting.addMetric('value', ['sum']);
    reporting.enableRetainer('second', 'value', ['sum']);
    reporting.enableRetainer('minute', 'value', ['sum']);
    const data1 = [{value: 50},{value: 2}];
    const data2 = [{value: 5},{value: 2}];
    const start = new Date().getTime() - 1000*60*60;
    const end = new Date().getTime() + 1000*60*60;
    const bucketsecond = reporting.getEmptyBuckets('second', start, end);
    bucketsecond[reporting.getRetainerBucketKey('second')] = 52;
    const bucketminute = reporting.getEmptyBuckets('minute', start, end);
    bucketminute[reporting.getRetainerBucketKey('minute')] = 59;

    reporting.saveMetrics(data1).then(() => {
      setTimeout(() => {
        bucketsecond[reporting.getRetainerBucketKey('second')] = 7;

        reporting.saveMetrics(data2).then(() => {
          expect(Promise.all([
            expect(reporting.filter().sum('value').during('second').range(start, end).valuesAsObject(true)).to.become(bucketsecond),
            expect(reporting.filter().sum('value').during('minute').range(start, end).valuesAsObject(true)).to.become(bucketminute)
          ])).notify(done);
        }).catch((err) => {
          done(new Error(err));
        });
      }, 1000);
    }).catch((err) => {
      done(new Error(err));
    });
  });
});
