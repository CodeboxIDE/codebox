#!/usr/bin/env ruby
# bin/use <build-dir>

build_dir = ARGV[0]
paths = Dir.glob(File.join(build_dir, "*"))
if (paths.size != 1)
  STDOUT.puts("no")
  exit(1)
else
  path = paths.first
  if (File.file?(path) && !File.symlink?(path) && path.match(/\.lgo$/) && (File.size(path) < 100_000))
    STDOUT.puts("Logo")
    exit(0)
  else
    STDOUT.puts("no")
    exit(1)
  end
end
