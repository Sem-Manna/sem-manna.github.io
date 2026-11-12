all: bin pre descend generate post

.PHONY: all bin pre descend generate post clean
.NOTPARALLEL:

bin:
	$(MAKE) -C bin

pre:
	./pre.sh

descend:
	find content -name 'Makefile' | \
		while IFS= read -r sub; do \
			[ -z "$$sub" ] && continue; \
			tdir=$$(dirname "$$sub"); \
			$(MAKE) -C "$$tdir" || exit $$?; \
		done

generate:
	./cyc.sh '*.html' '*.xml'

post:
	./post.sh

clean:
	cd bin && $(MAKE) clean
	rm -rf public
