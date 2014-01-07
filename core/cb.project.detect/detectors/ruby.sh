#!/usr/bin/env ruby

$:.unshift File.expand_path("../../lib", __FILE__)
require "language_pack"

if pack = LanguagePack.detect(ARGV.first)
  puts pack.name
  exit 0
else
  puts "no"
  exit 1
end
