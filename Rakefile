require 'fileutils'

def root_path
  File.dirname(__FILE__)
end

def version
  File.read(File.join(root_path, 'VERSION'))
end

desc "Build autocompleter_jsonsearch" 
task :dist do
  file = File.new(File.join(root_path, 'dist', "autocompleter_jsonsearch.#{version}.js"), 'w')
  file.write(File.read(File.join(root_path, 'lib', 'json_search.0.9.0.js')))
  file.write(File.read(File.join(root_path, 'src', "autocompleter_jsonsearch.js")))
  file.close
end

desc "Run the specs"
task :spec do
  system("open #{File.join(root_path, 'spec', 'suite.html')}")
end
