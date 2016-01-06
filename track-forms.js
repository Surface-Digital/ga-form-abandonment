/**
 *
 * Track form timing and abandonment automatically in Google Analytics
 * 
 * Requires Google Analytics classic (ga.js)
 * TODO: Update to Universal analytics
 * 
*/
	
	
  (function() {

      
          function track(options) {
        		
        	  options.unshift('_trackEvent'); 
        	  _gaq.push(options); 
        	
          }
      	
      var forEach = function (array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
          callback.call(scope, i, array[i]); 
        }
      };
      
      var forms = document.querySelectorAll('form');
		
      forEach(forms, function (index, form) {
				
        var fields = {};
        var fieldHistory = [];
        var formSubmitted = false; 
        var totalTime = 0; 
        
        // Humanise form title
        if (form.id) { 
          var formTitle = form.id.replace('_', ' ').replace( /([A-Z])/g, "$1" );
          formTitle = formTitle.charAt(0).toUpperCase() + formTitle.slice(1); 
        } else { 
          var formTitle = 'Untitled form'; 
        }
				
        var enterField = function(name) {
          fields[name] = new Date().getTime();
        }; 
        
        var leaveField = function(e) {
          var timeSpent;
          var fieldName = e.target.name;
          var leaveType = e.type;
          if (fields.hasOwnProperty(fieldName)) {
            timeSpent = new Date().getTime() - fields[fieldName];
            if (timeSpent > 0 && timeSpent < 1800000 && fieldName) {
                  
              track([formTitle, fieldName, leaveType, parseInt(timeSpent/1000)], false); 
              if (leaveType == 'change') {
                fieldHistory.push(fieldName); 
              }
							totalTime += parseInt(timeSpent/1000);
              
            }
            delete fields[fieldName];
          }
        
        };
        
        // Modern browsers
        if (form.addEventListener){
        
          // Timings
          form.addEventListener('focus', function(e) { enterField(e.target.name); }, true);
          form.addEventListener('blur', function(e) { leaveField(e); }, true);
          form.addEventListener('change', function(e) { leaveField(e); }, true);
          
          // Submission
          form.addEventListener('submit', function(e) { 
              
              track([formTitle, 'Submitted', fieldHistory.join(' > '), totalTime], true); 
              formSubmitted = true; 
              
          });
          
          // Abandonment... 
          window.addEventListener("unload", function(e) { 
            if (fieldHistory != '' && !formSubmitted) {
                track([formTitle, 'Abandoned', fieldHistory.join(' > '), totalTime], false); 
            }
          });
          
        // Old IE browsers
        } else if (form.attachEvent){
          
          // Timings
          form.attachEvent('onfocus', function(e) { enterField(e.target.name); });
          form.attachEvent('onblur', function(e) { leaveField(e); });
          form.attachEvent('onchange', function(e) { leaveField(e); });
          
          // Submission
          form.attachEvent('onsubmit', function(e) { 
            track([formTitle, 'Submitted', fieldHistory.join(' > '), totalTime], true); 
          });
          
        }
     
    });
    
  })();
