(function($){

	var csvConverter = {
		init: function() {
			// this.csvUrl = '/images24/promocje/2017/'+landingPage.projectFolder+'/top_sprzety.csv';
			// this.csvUrl = 'promo_tv.csv';
			this.csvUrl = 'filters.csv';
			// this.csvUrl = 'promo.csv';
			// this.csvUrl = 'prods.csv';
			this.products = [];
			this.def = $.Deferred();
			this.getCsv();  

			return this.def.promise();
		},
		getCsv: function() {
			var _ = this;

			$.get(this.csvUrl, function(data) {
				// console.log(data);
				_.convertToJSON(data);
				_.def.resolve();
			});
		},
		convertToJSON: function(csv) {
			// console.log(csv);
			var lines = csv.split('\r\n'),
				headers = lines[0].split(';');

			lines.shift();

			for(var i=0; i < lines.length; i++) {
				var obj = {},
					currentLine = lines[i].split(';');
					// console.log(currentLine);

				for(var j=0; j < headers.length; j++){
					obj[headers[j]] = currentLine[j];
				}

				this.products.push(obj);
			}

			// console.log(this.products);
			$('#lp-csv').html(JSON.stringify(this.products));
		}
	};

	var epicFilters = {
		init: function(){
			this.setup();
			this.getCsvData();
		},
		setup: function(){
			this.products = [];
			this.filter = [];
			this.csvUrl = 'filters.csv';
		},
		getCsvData: function(){
			var _ = this;
			var csvData = new Promise(function(resolve, reject){
				$.get(_.csvUrl, function(csvData){
					resolve(csvData);
				});
			});
			csvData.then(function(csvData){
				_.parseToJSON(csvData);
				_.makeFilterRelation(_.products);
			});
			csvData.catch(function(reason){
				console.log(reason);
			});
		},
		parseToJSON: function(csv) {
			var lines = csv.split('\r\n'),
				headers = lines[0].split(';');

			lines.shift();

			for(var i=0; i < lines.length; i++) {
				var obj = {},
					currentLine = lines[i].split(';');

				for(var j=0; j < headers.length; j++){
					obj[headers[j]] = currentLine[j];
				}

				this.products.push(obj);
			}
		},
		makeFilterRelation: function(arr){
			var _ = this,
				newCat = '',
				tempFilterArray = [],
				filterArray = [],
				tempSubfilterArray = [],
				subFilterArray = [];

			function Filter(id, name, subFiltersArr, priority){
				this.id = id;
				this.priority = priority;
				this.name = name;
				this.subFilters = subFiltersArr;
			}

			function SubFilter(id, name){
				this.id = id;
				this.name = name;
			}


			for(var i=0, len = arr.length; i<len; i++){
				// console.log(arr[i]);
				newCat = arr[i].category;

				var notInFilters = tempFilterArray.indexOf(newCat);

				if( notInFilters === -1 && newCat !== undefined ){
				// console.log("------------"+newCat+"--------------");

					tempFilterArray.push(newCat)

					for(var j=0, len = arr.length; j<len; j++){

						if(arr[j].category === newCat){
							
							var newSubCat = arr[j].sub_category,
								notInSubFilters = tempSubfilterArray.indexOf(newSubCat);

							if(notInSubFilters === -1 && newSubCat !== undefined && newSubCat !== '') {

								tempSubfilterArray.push(newSubCat);
								var subFilter = new SubFilter( arr[j].sub_category, arr[j].sub_category_name);	
								subFilterArray.push(subFilter);

							}

						}

					}

					// console.log(subFilterArray);

					var targetElement = this.findObjectInArray(subFilterArray, 'id', 'inne'); // znajdz inne w kategorii

					subFilterArray = this.removeElementFromArray(subFilterArray, 'id', 'inne'); //usuń inne z kategorii
					// console.log(subFilterArray);
					
					if(targetElement[0] !== undefined){
						subFilterArray.push(targetElement[0]); // dodaj inne na końcu
					}

					// console.log(subFilterArray);

					var filter = new Filter(arr[i].category, arr[i].category_name, subFilterArray, arr[i].category_priority);
					filterArray.push(filter);

					subFilterArray = [];
					tempSubfilterArray = [];

				}

			}
			// console.log(filterArray);
			filterArray = this.sortArray(filterArray, 'priority'); //params: array, string, string ('desc')
			// console.log(filterArray);
			$('#lp-csv').html(JSON.stringify(filterArray));
			
		},
		findObjectInArray: function(arr, propName, targetPropValue){
			var result = $.grep(arr, function(el){
				return el[propName] === targetPropValue;
			});
			return result;
		},
		removeElementFromArray: function(arr, propName, targetPropValue){
			var result = $.grep(arr, function(el){
				return el[propName] === targetPropValue;
			}, true);
			return result;
		},
		sortArray: function(array, sortKey, direction){
			var direction = (direction !== undefined && direction === 'desc') ? direction : '',
				newOrder = array.sort(function(a,b){
					return direction === 'desc' ? b[sortKey]-a[sortKey] : a[sortKey]-b[sortKey];
			});
			return newOrder;
		}
	};

	$(function() {
		epicFilters.init();
		// csvConverter.init();
	});
})(jQuery);
