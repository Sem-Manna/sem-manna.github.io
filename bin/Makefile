CC = cc
CFLAGS = -Os -std=c99 -pedantic -Wall -Wextra -Werror -Wformat=2 -Wformat-security \
		 -Wstrict-prototypes -fstack-protector-strong -D_FORTIFY_SOURCE=2
LDFLAGS = -s
EXEEXT =
ifeq ($(OS),Windows_NT)
EXEEXT = .exe
endif

.PHONY: all clean check

all: replace$(EXEEXT) mtime$(EXEEXT)

replace$(EXEEXT): replace.c
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ replace.c

mtime$(EXEEXT): mtime.c
	$(CC) $(CFLAGS) $(LDFLAGS) -D_XOPEN_SOURCE=500 -o $@ mtime.c

check: all
	@echo "Checking binaries exist and are executable..."
	@test -x replace$(EXEEXT) || (echo "Error: replace not executable" && exit 1)
	@test -x mtime$(EXEEXT) || (echo "Error: mtime not executable" && exit 1)
	@echo "All checks passed."

clean:
	rm -f replace$(EXEEXT) mtime$(EXEEXT)
