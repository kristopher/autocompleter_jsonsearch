/*
  This is only meant to search an array of objects if you need to search a 
  single level array of strings use Autocompleter.Local

  Field matchers:
    prefix: matches from the begining of the string
    infix: matches anywhere in the string
    exact: matches the whole string
    word: matches a word in the string using word boundries

  Autocompleter.JSONSearch('element', 'update_element', data, {
    search_options: {
      fields: {
        name: 'prefix',
        category: 'infix'
      },
      ranks: {
        name: 1,
        category: 0 // Default is 0
      },
      case_sensitive: false,
      limit: 10,
      offset: 0
    },
    format_options: {
      order: ['name', 'category']
        select: 'name'
    }
  })
*/
//TODO override the select option handler take an array
//TODO add dependencies 
Autocompleter.JSONSearch = Class.create(Autocompleter.Local, {
  
  patterns: {
    infix: '(.*?)($token)(.*?)',
    prefix: '^($token)(.*?)',
    exact: '^($token)$',
    word: '(.*?\\b)($token)(\\b.*?)',
    word_prefix: "^(.*?\\b)($token)(.*?)$"
  },
  
  initialize: function($super, element, update, data, options) {
    this.options = (options || {});
    this.format_options = this.extractFormatOptions();
    this.search_options = this.extractSearchOptions();
    this.setupJSONSearch();
    this.setupSearchSelector();
    $super(element, update, data, options);
    if (this.options.focus) {
      $(element).focus();
    }
  },
  
  setupJSONSearch: function() {
    this.json_search = new JSONSearch(this.search_options);
  },

  extractSearchOptions: function() {
    var search_options = Object.clone(this.options.search_options || {});
    if (Object.isUndefined(search_options.limit)) {
      search_options.limit = (this.options.choices || 10);
    }
    if (Object.isUndefined(search_options.case_sensitive)) {
      search_options.case_sensitive = !!this.options.ignoreCase;
    }
    return search_options;
  },
  
  extractFormatOptions: function() {
    var format_options = Object.clone(this.options.format_options);    
    if (!format_options.order) {
      format_options.order = Object.keys(this.search_options.fields);
    }
    return format_options;
  },
  
  setupSearchSelector: function() {
    this.options.selector = function(instance) {
      var token = instance.getToken();
      var results = instance.json_search.getResults(token, instance.options.array);
      return instance.parseResults(results, token);
    }
  },
  
  parseResults: function(results, token) {
    var formatted_fields = [], formatted_results = [], self = this;
    results._each(function(result) {  
      self.format_options.order._each(function(field) {
        formatted_fields.push(self.parseResult(result[field], token, field));
      });
      formatted_results.push(self.wrapFields(formatted_fields.compact().join("\n"), result));
    });
    return ('<ul>' + formatted_results.join("\n") + '</ul>');
  },
  
  parseResult: function(result, token, field) {
    var subbed_result = this.subResult(result, token, this.search_options.fields[field])    
    return this.wrapField(subbed_result, field);
  },
  
  wrapFields: function(results, object) {
    return ('<li>' + results + '</li>');
  },
  
  wrapField: function(result, field) {
    if (!result.blank()) {
      return ('<span class="' + this.classForFieldWrapper(field) + '">' + result + '</span>');      
    }
  },

  classForFieldWrapper: function(field) {
    var klass = '';
    if (this.format_options.select && (this.format_options.select != field)) {
      klass = 'informal';
    }
    return klass;
  },  
  
  subResult: function(result, token, pattern) {
    return result.sub(this.getRegex(token, pattern), this.getMatchFunction(pattern, result).bind(this));
  },
  
  getMatchFunction: function(pattern, result) {
    return this['matchFunctionFor' + pattern.split('_').invoke('capitalize').join('')](result);
  },
  
  matchFunctionForInfix: function(result) {
    return function(match) {
      if (match[3] != result) {
        return (match[1] + '<strong>' + match[2] + '</strong>' + match[3]);
      }
    }.bind(this);
  },
    
  matchFunctionForPrefix: function(result) {
    return function(match) {
      if (match[2] != result) {
        return ('<strong>' + match[1] + '</strong>' + match[2]);
      }
    }.bind(this);
  },
  
  matchFunctionForExact: function(result) {
    return function(match) {
      if (match != result) {
        return ('<strong>' + match[1] + '</strong>');
      }
    }.bind(this);
  },

  matchFunctionForWord: function(result) {
    return this.matchFunctionForInfix(result);
  },

  matchFunctionForWordPrefix: function(result) {
    return this.matchFunctionForInfix(result);
  },
  
  getRegex: function(token, pattern) {
    return new RegExp(this.patterns[pattern].gsub(/\$token/, RegExp.escape(token)), this.json_search.case_sensitive);
  },
  
  onClick: function($super, event) {
    $super(event);
    event.stop();
  }
  
});

