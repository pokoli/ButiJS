test:
	../node_modules/mocha/bin/mocha -u exports -R list --ignore-leaks ../test/*.test.js 
debug:
	../node_modules/node-inspector/bin/inspector.js &
	../node_modules/mocha/bin/mocha -u exports --debug -R list --ignore-leaks ../test/*.test.js 
