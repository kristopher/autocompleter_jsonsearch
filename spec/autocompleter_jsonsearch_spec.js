Screw.Unit(function() {
  describe("Autocompleter.JSONSearch", function() {
    var autocompleter_jsonsearch, json_data, options;
    before(function() {
      json_data = [{ name: 'kris', category: 'developer' }, { name: 'bob', category: 'manager' }];
      options = { 
        search_options: {          
          fields: { name: 'prefix', category: 'infix'  }
        },
        format_options: { order: ['name', 'category'] },
      }
      autocompleter_jsonsearch = Smoke.Mock(new Autocompleter.JSONSearch('input_field', 'update_field', json_data, options));
    });    
        
    describe("initialize", function() {      
      it("should call setupJSONSearch", function() {
        autocompleter_jsonsearch.should_receive('setupJSONSearch').exactly('once');
        autocompleter_jsonsearch.initialize('input_field', 'update_field', json_data, options);
        autocompleter_jsonsearch.checkExpectations();
      });

      it("should call extractFormatOptions", function() {
        autocompleter_jsonsearch.should_receive('extractFormatOptions').exactly('once');
        autocompleter_jsonsearch.initialize('input_field', 'update_field', json_data, options);
        autocompleter_jsonsearch.checkExpectations();
      });

      it("should call extractSearchOptions", function() {
        autocompleter_jsonsearch.should_receive('extractSearchOptions').exactly('once');
        autocompleter_jsonsearch.initialize('input_field', 'update_field', json_data, options);
        autocompleter_jsonsearch.checkExpectations();        
      });

      it("should call setupSearchSelector", function() {
        autocompleter_jsonsearch.should_receive('setupSearchSelector').exactly('once');
        autocompleter_jsonsearch.initialize('input_field', 'update_field', json_data, options);
        autocompleter_jsonsearch.checkExpectations();        
      });

      it("should call focus on the input if the focus option is true", function() {
        var mock_element = Smoke.Mock($('input_field'));
        mock_element.should_receive('focus').exactly('once');
        autocompleter_jsonsearch.initialize(mock_element, 'update_field', json_data, Object.extend(options, { focus: true}));
        mock_element.checkExpectations();        
      });
    });

    describe("setupJSONSearch", function() {      
      it("should create a new JSONSearch and set it to the json_search property", function() {
        expect(autocompleter_jsonsearch.json_search.constructor).to(equal, JSONSearch);
      });      
    });
    
    describe("extractFormatOptions", function() {
      it("should return an object", function() {
        expect(autocompleter_jsonsearch.extractFormatOptions().toString()).to(match, /object Object/);
      });
      
      it("should return the format_options", function() {
        // hacky. the equal matcher is iffy with objects.
        expect(autocompleter_jsonsearch.extractFormatOptions().order).to(equal, ['name', 'category']);  
      });
    });

    describe("extractSearchOptions", function() {
      it("should return an object", function() {
        expect(autocompleter_jsonsearch.extractSearchOptions().toString()).to(match, /object Object/);
      });
      
      it("should set the limit to 10 if limit is not passed", function() {
        expect(autocompleter_jsonsearch.extractSearchOptions().limit).to(equal, 10);
      });
      
      it("should set case_sensitive to true if case_sensitive is not passed", function() {
        expect(autocompleter_jsonsearch.extractSearchOptions().case_sensitive).to(be_true);
      });
      
      it("should set the merge the search options that are passed", function() {
        expect(autocompleter_jsonsearch.extractSearchOptions().fields).to(equal, { name: 'prefix', category: 'infix'  });
      });
      
      describe("with limit and ignore_case passed as search options", function() {
        before(function() {
          autocompleter_jsonsearch_with_additional_options = new Autocompleter.JSONSearch('input_field', 'update_field', json_data, { 
            search_options: {          
              fields: { name: 'prefix', category: 'infix'  },
              limit: 15,
              case_sensitive: false
            },
            format_options: { order: ['name', 'category'] }
          });        
        });
        it("should set the limit to the limit that is passed", function() {
          expect(autocompleter_jsonsearch_with_additional_options.extractSearchOptions().limit).to(equal, 15);
        });

        it("should set case_sensitive to false if case_sensitive is not passed", function() {
          expect(autocompleter_jsonsearch_with_additional_options.extractSearchOptions().case_sensitive).to(be_false);
        });
      });

      describe("with limit and ignore_case passed as autocompleter options", function() {
        before(function() {
          autocompleter_jsonsearch_with_additional_options = new Autocompleter.JSONSearch('input_field', 'update_field', json_data, { 
            ignoreCase: true,
            choices: 15,
            search_options: {          
              fields: { name: 'prefix', category: 'infix'  },
            },
            format_options: { order: ['name', 'category'] }
          });        
        });
        it("should set the limit to the autocompleter choices option", function() {
          expect(autocompleter_jsonsearch_with_additional_options.extractSearchOptions().limit).to(equal, 15);
        });

        it("should set the case_sensitive to the autocompleter ignoreCase option", function() {
          expect(autocompleter_jsonsearch_with_additional_options.extractSearchOptions().case_sensitive).to(be_true);
        });
      });

      describe("formatting the return list", function() {
        var results, token, parsed_list, case_sensitive;
        before(function() {
          case_sensitive = 'i';
          token = 'a';
          results = autocompleter_jsonsearch.json_search.getResults(token, json_data);
          parsed_list = ("<ul><li><span class=\"\">bob</span>\n<span class=\"\">m<strong>" + token + '</strong>nager</span></li></ul>');
        })        
        
        describe("parseResults", function() {
          it("should return a list of parsed results", function() {
            expect(autocompleter_jsonsearch.parseResults(results, token)).to(equal, parsed_list);
          });

          it("return the li in the order define by the format_options order", function() {
            autocompleter_jsonsearch.format_options.order = ['category', 'name'];
            list = ("<ul><li><span class=\"\">m<strong>" + token + '</strong>nager</span>\n<span class=\"\">bob</span></li></ul>');
            expect(autocompleter_jsonsearch.parseResults(results, token)).to(equal, list);
          });
        });

        describe("wrapFields", function() {
          it("should return the results wrapped in an li", function() {
            expect(autocompleter_jsonsearch.wrapFields(results)).to(match, new RegExp("^<li>.*</li>$"));            
          })
        })

        describe("parseResult", function() {
          it("should call the correct sub result function for the field", function() {
            var result = results.first().category;
            autocompleter_jsonsearch.should_receive('subResult').with_arguments(result, token, 'infix').exactly('once').and_return('');
            autocompleter_jsonsearch.parseResult(result, token, 'category');
            autocompleter_jsonsearch.checkExpectations();
          });
          
          it("should return the subbed result wrapped in a span tag", function() {
            var result = results.first().category;
            var subbed_result = autocompleter_jsonsearch.subResult(result, token, 'infix');
            autocompleter_jsonsearch.should_receive('wrapField').with_arguments(subbed_result, 'category').exactly('once').and_return('');
            autocompleter_jsonsearch.parseResult(result, token, 'category');
            autocompleter_jsonsearch.checkExpectations();
          });

        });

        describe("wrapField", function() {
          it("should return the the field wrapped in a span", function() {
            expect(autocompleter_jsonsearch.wrapField('test', 'name')).to(equal, '<span class="">test</span>')
          });
        });
        
        describe("classForFieldWrapper", function() {
          var autocompleter_jsonsearch_with_select;
          before(function() {
            autocompleter_jsonsearch_with_select = new Autocompleter.JSONSearch('input_field', 'update_field', json_data, { 
              search_options: {          
                fields: { name: 'prefix', category: 'infix'  }
              },
              format_options: { 
                select: 'name',
                order: ['name', 'category'] 
              }
            });
          });    

          it("should return informal if the key is not equal to the select option", function() {
            expect(autocompleter_jsonsearch_with_select.classForFieldWrapper('category')).to(equal, 'informal');
          });
          
          it("should return an empty string if the key is equal to the select options", function() {
            expect(autocompleter_jsonsearch_with_select.classForFieldWrapper('name')).to(equal, '');
          });
        })
        
        describe("subResult", function() {

          describe("for infix", function() {
            it("should replace the token with the token wraped in a strong tag", function() {
              var result = results.first().category;
              var pattern = new RegExp('<strong>' + token + '</strong>', case_sensitive);
              expect(autocompleter_jsonsearch.subResult(result, token, 'infix')).to(match, pattern);          
            })
          })

          describe("for prefix", function() {
            it("should replace the token with the token wraped in a strong tag", function() {
              token = 'b';
              var result = results.first().name;
              var pattern = new RegExp('<strong>' + token + '</strong>', case_sensitive);
              expect(autocompleter_jsonsearch.subResult(result, token, 'prefix')).to(match, pattern);          
            });

            it("should not replace the token anywhere but the begining of the string", function() {
              token = 'a';
              var result = results.first().category;
              var pattern = new RegExp(token, case_sensitive);
              expect(autocompleter_jsonsearch.subResult(result, token, 'prefix')).to(match, pattern);          
            })
          })

          describe("for exact", function() {
            it("should replace the token with the token wraped in a strong tag", function() {
              var token = "bob dole"
              var result = "bob dole"
              var pattern = new RegExp('<strong>' + token + '</strong>', case_sensitive);
              expect(autocompleter_jsonsearch.subResult(result, token, 'exact')).to(match, pattern);          
            })
          })

          describe("for word", function() {
            it("should replace the token with the token wraped in a strong tag", function() {
              var token = 'replace'
              var result = "should replace word"
              var pattern = new RegExp("should <strong>" + token + "</strong> word", case_sensitive);
              expect(autocompleter_jsonsearch.subResult(result, token, 'word')).to(match, pattern);          
            });
          });          

          describe("for word prefix", function() {
            it("should replace the token with the token wraped in a strong tag", function() {
              var token = 'repl'
              var result = "should replace word prefix"
              var pattern = new RegExp("should <strong>" + token + "</strong>ace word prefix", case_sensitive);
              expect(autocompleter_jsonsearch.subResult(result, token, 'word_prefix')).to(match, pattern);          
            });
          });          
        });
      })
    });
  });
});