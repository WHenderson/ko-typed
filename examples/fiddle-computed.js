var ko = require('knockout');

var step = 0;
var base = ko.observable('a');
var collateral = ko.observable(1);

var comp = ko.computed({
  pure: true,
  deferEvaluation: true,
  read: function () {
    console.log('step:', step, 'base:', base());
    //collateral(collateral() + 1);
    comp.subscribe(function (value) { console.log('base changed:', value ); })
  }
});

var subscribed = false;

collateral.subscribe(function (value) {
  console.log('collateral:', value);
  console.log('comp:', comp());

  if (!subscribed) {
    //base.subscribe(function (value) { console.log('base changed:', value ); });
    comp.subscribe(function (value) { console.log('base changed:', value ); });
    subscribed = true;
  }
});

++step;
comp();
console.log('deps:', comp.getDependenciesCount());
++step;
base('b');
++step;
comp();
