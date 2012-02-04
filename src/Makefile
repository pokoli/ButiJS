test:
	../node_modules/expresso/bin/expresso -t 3000 --serial ../test/*.test.js 
debug:
	../node_modules/node-inspector/bin/inspector.js &
	node --debug-brk ../node_modules/expresso/bin/expresso --serial ../test/*.test.js
