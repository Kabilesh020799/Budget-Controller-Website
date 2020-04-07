var budgetcontroller = (function(){

	var income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	expense.prototype.calcpercentage = function(totalincome)
	{
		if(totalincome>0)
		{
			this.percentage = Math.round((this.value/totalincome)*100);
		}
		else
		{
			this.percentage = -1;
		}
	}
	expense.prototype.getpercentage = function()
	{
		return this.percentage;
	}
	var calculatetotal = function(type)
	{
		var sum =0;
		data.allitems[type].forEach(function(cur)
		{
			sum += cur.value;
		});
		data.totals[type] = sum;
	}
	var data = {
		allitems: {
			inc:[],
			exp:[]
		},
		totals: {
			inc:0,
			exp:0
		},
		budget : 0,
		percentage : 0
	};
	return {
		additem: function(type,des,val)
		{
			var newitem,id;
			Id=0;

			//create new id
			if(data.allitems[type].length > 0){
				Id = data.allitems[type][data.allitems[type].length-1].id+1;	
			}
			else{
				Id=0;
			}
			
			
			//create new item
			if(type === 'exp')
				newitem = new expense(Id,des,val);
			else if(type === 'inc')
				newitem = new income(Id,des,val);
			
			//push the new item
			data.allitems[type].push(newitem);

			//return new element
			return newitem;
		},
		deleteitem: function(type,id)
		{
			var ids,index;
			ids = data.allitems[type].map(function(current){
				return current.id;
			});
			index = ids.indexOf(id);
			if(index !== -1)
			{
				data.allitems[type].splice(index,1);
			}
		},
		calculatebudget: function()
		{
			//1.calculate total income and expense
			calculatetotal('inc');
			calculatetotal('exp');

			//2.calculate the budget
			data.budget = data.totals.inc - data.totals.exp;
			if(data.totals.inc>0)
			//3.calculate the income percentage that we spent
			{data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);}
			else
			{
				data.percentage = -1;
			}
		},
		calculatepercentage: function()
		{
			//1.Calculate percentage
			data.allitems.exp.forEach(function(cur){
				cur.calcpercentage(data.totals.inc);
			});
			
		},
		getbudget: function()
		{
			return {
				budget : data.budget,
				totalinc : data.totals.inc,
				totalexp : data.totals.exp, 
				percentage : data.percentage 
			}
		},
		getpercentage: function()
		{
			//2.get percentage
			var allperc = data.allitems.exp.map(function(cur){
				return cur.getpercentage();

			});
			return allperc;

		},

		testing: function()
		{
			console.log(data);
		}
	};



})();


var UIController = (function()
{
	var domstrings = {
		inputtype: '.add__type',
		inputdesc: '.add__description',
		inputvalue: '.add__value',
		inputbutton: '.add__btn',
		inclist : '.income__list',
		explist : '.expenses__list',
		budgetvalue: '.budget__value',
		budgetincome: '.budget__income--value',
		budgetexpenses: '.budget__expenses--value',
		budgetpercentage: '.budget__expenses--percentage',
		container: '.container',
		expensesperc:'.item__percentage',
		datelabel: '.budget__title--month'
	}
	var formatstring = function(num,type)
        {
        	var numsplit,int,dec;
        	num = Math.abs(num);
        	num = num.toFixed(2);
        	numsplit = num.split('.');
        	int = numsplit[0];
        	if(int.length>3)
        	{
        		int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3 ,3);
        	}
        	dec = numsplit[1];
        	return (type === 'exp'?'-':'+') + ' ' + int + '.' + dec;
        };
        var nodelistforeach = function(list,callback)
        	{
        		for(var i=0;i<list.length;i++)
        		{
        			callback(list[i],i);
        		}
        	};
	return {
        getinput: function() {
            return {
                type: document.querySelector(domstrings.inputtype).value, // Will be either inc or exp
                description: document.querySelector(domstrings.inputdesc).value,
                value:parseFloat(document.querySelector(domstrings.inputvalue).value)
            };
        },
        getdomstrings:function()
        {
        	return domstrings;
        },
        
        addlistitem:function(obj,type)
        {
        	var html,newhtml,element;
        	
        	//create html  with placeholder text
        	if(type === 'inc')
        	{
        		element = domstrings.inclist;
        		html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        	}
        	else if(type === 'exp')
        	{
        		element = domstrings.explist;
        		html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        	}

        	//replace the placehoder with the actual data

        	newhtml = html.replace('%id%',obj.id);
        	newhtml = newhtml.replace('%description%',obj.description);
        	newhtml = newhtml.replace('%value%',formatstring(obj.value,type));

        	//insert the html into the dom

      		document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        },
        deletelistitem: function(selectorid)
        {
        	var el = document.getElementById(selectorid);
        	el.parentNode.removeChild(el);
        },
        clearfields:function()
        {
        	var fields,fieldarr;
        	fields = document.querySelectorAll(domstrings.inputdesc + ', ' + domstrings.inputvalue);
        	fieldarr = Array.prototype.slice.call(fields);
        	fieldarr.forEach(function(current,index,array)
        	{
        		current.value = "";
        	});
        },
        displaybudget: function(obj)
        {
        	var type;
        	obj.budget > 0?type='inc':type ='exp';
        	document.querySelector(domstrings.budgetvalue).textContent = formatstring(obj.budget,type);
        	document.querySelector(domstrings.budgetincome).textContent = formatstring(obj.totalinc,'inc');
        	document.querySelector(domstrings.budgetexpenses).textContent = formatstring(obj.totalexp,'exp');

        	if(obj.percentage !== -1)
        	{
        		document.querySelector(domstrings.budgetpercentage).textContent = obj.percentage + '%';
        	}
        	else
        	{
        		document.querySelector(domstrings.budgetpercentage).textContent = '---';
        	}
        	
        },
        displaypercentage: function(percentages)
        {
        	var fields = document.querySelectorAll(domstrings.expensesperc);
        	
        	nodelistforeach(fields,function(current,index)
        	{
        		if(percentages[index]>0)
        		{
        			current.textContent = percentages[index] + "%";
        		}
        		else
        		{
        			current.textContent = '---';
        		}
        	});
        },
        changedtype: function()
        {
        	var fields = document.querySelectorAll(domstrings.inputtype + ',' + domstrings.inputdesc + ',' + domstrings.inputvalue);
        	nodelistforeach(fields,function(cur)
        	{
        		cur.classList.toggle('red-focus');
        	});
        	document.querySelector(domstrings.inputbutton).classList.toggle('red');
        },
        displaydate: function()
        {
        	var now,year,month;
        	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        	now  = new Date();
        	year = now.getFullYear();
        	month = now.getMonth();
        	document.querySelector(domstrings.datelabel).textContent = months[month] + ',' + year;

        }
	};
})();


var controller = (function(budgetcontrol,UIControl){
	
	var setupeventlisteners = function()
	{
		var dom = UIControl.getdomstrings();
		document.querySelector(dom.inputbutton).addEventListener('click',addctrlitem);
		document.addEventListener('keypress',function(event){
		if(event.keyCode === 13)
		{
			addctrlitem();
		}	
	});
		document.querySelector(dom.container).addEventListener('click',deletectrlitem);
		document.querySelector(dom.inputtype).addEventListener('change',UIControl.changedtype);
	};
	var updatebudget = function()
	{
		//1.calculate the budget
		budgetcontrol.calculatebudget();

		//2.return the budget
		var budget = budgetcontrol.getbudget();
		
		//3.update the budget on ui
		UIControl.displaybudget(budget);


	};
	var updatepercentage = function()
	{
		//1.calculate percentage
		budgetcontrol.calculatepercentage();
		//2.Read the percentage from the budget controller
		var percentage = budgetcontrol.getpercentage();
		//3.update the new percentage in UI
		UIControl.displaypercentage(percentage);

	}
	
	var addctrlitem = function()
	{
		
		//1.Get the field input data
		var input = UIControl.getinput();
		if(input.description !=="" && !isNaN(input.value) && input.value>0)
		{
			//2.add the item to the budget controller
			var newitem = budgetcontrol.additem(input.type,input.description,input.value);
			//3.Add item to the UI
			UIControl.addlistitem(newitem,input.type);
			//4.clear all fieelds
			UIControl.clearfields();
			//5.calculate and update the budget
			updatebudget();	
			//6.Calculate and update percentage
			updatepercentage();

		}
	
		console.log("it works");
	};
	var deletectrlitem = function(event)
	{
		var itemid,splitid,type,Id;
		itemid = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemid)
		{
			splitid = itemid.split('-');
			type = splitid[0];
			Id = parseInt(splitid[1]);
			//1.delete the item from the data structure
			budgetcontrol.deleteitem(type,Id);
			//2.delete the item from ui
			UIControl.deletelistitem(itemid);
			//3.update and show the budget
			updatebudget();


		}

	};
	return {
		init:function()
		{
			console.log("Application as started");
			UIControl.displaybudget({budget : 0,
				totalinc : 0,
				totalexp : 0, 
				percentage : 0 });
			UIControl.displaydate();
			setupeventlisteners();
		}
	};

	

	})(budgetcontroller,UIController);
	controller.init();