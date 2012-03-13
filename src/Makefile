MOCHA = ../node_modules/mocha/bin/mocha
REPORTER = list
OPTS = -u exports -R $(REPORTER) --ignore-leaks ../test/*.test.js 
test:
	$(MOCHA) $(OPTS)
debug:
	../node_modules/node-inspector/bin/inspector.js &
	$(MOCHA) --debug-brk $(OPTS)
test-cov: lib-cov
	@COVERAGE=1 $(MAKE) test REPORTER=html-cov > coverage.html
lib-cov:
	rm -Rf ../src-cov
	@jscoverage ./ ../src-cov --exclude=./locales/
