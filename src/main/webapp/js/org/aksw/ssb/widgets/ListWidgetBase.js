(function($) {

	var backboneUtils = Namespace("org.aksw.utils.backbone");
	var stringUtils = Namespace("org.aksw.ssb.utils.strings");

	
	var ns = Namespace("org.aksw.ssb.widgets");

	ns.ItemRendererBackbone = function(viewCtor) {
		this.viewCtor = viewCtor;
	};
	
	ns.ItemRendererBackbone.prototype = {
			create: function(model, parent) {
		
				var view = new this.viewCtor({model: model});
		
				return view.render().el;
			}
	};
	
	
	/**
	 * This helper function provides indirect access
	 * to member 'key' on 'data' via 'binding'.
	 * 
	 * Binding may either:
	 * - map the key to another key
	 * - map the key to a function that is then applied on data 
	 * 
	 */
	ns.getDataValue = function(data, key, binding) {
		var b = binding ? binding[key] : null;
		var result;

		if(b) {
			if(typeof b === 'function') {
				return b(data);
			} else {				
				return data[b];
			}
		} else {
			return data[key];
		}
	};


	
	
	// TODO Make use of backbone for the selection model
	ns.SelectionModel = Backbone.Model.extend({
		defaults: {
			isSelected: false,
			label: "no label provided",
			data: null
	    }
	});

	
	ns.SelectionCollection = Backbone.Collection.extend({
		model: ns.SelectionModel
	});
	
	
		
	
	ns.RendererString = function(fnId, binding) {
		this.fnId = fnId;
		this.binding = binding;
	};
	
	
	ns.RendererString.prototype.create = function(data, parent) {
		var label = ns.getDataValue(data, "label", this.binding);
		
		var result = $$(ns.itemLabel, {parent: parent, label: label, fnId: this.fnId, data: data});
		
		return result;
	};
	
	
	ns.ItemRendererBackbone = function(viewCtor) {
		this.viewCtor = viewCtor;
	};
	
	ns.ItemRendererBackbone.prototype = {
			
			create: function(model, parent) {
				var view = new this.viewCtor({model: model});
		
				return view.render().el;
			}
	};

	

	
	ns.ListViewBase = Backbone.View.extend({
		//el: $('body'), // el attaches to existing element
		tagName: 'ul',
	    initialize: function(){
	      
	    	if(this.options.itemRenderer) {
	    		this.itemRenderer = this.options.itemRenderer;
	    	}
	    	
	    	//_.bindAll(this, 'render', 'addModel', 'reset');

	    	
	    	//this.collection = new List();
	    	//this.collection.bind('add', this.appendItem); // collection event binder

	    	this.collection.bind('add', this.addModel, this);
	    	this.collection.bind('reset', this.reset, this);
	    	//this.collection.remove('remove', this.unrender, this);
	    	
	    	//this.render();
	    },
	    addModel: function(model) {
			var renderer = this.getItemRenderer();	
			
			var el = renderer.create(model, this);
			this.appendElement(el);
	    },
	    
	    /*
	    appendElement: function(el) {
	    	var result = this.prototype.appendElement.call(this, el); //Backbone.View.prototype.
	    },
	    */		

	    render: function() {
			//this.clear();
			
	    	Backbone.View.prototype.render.apply(this);
	    	
			var self = this;

			this.collection.each(function(model) {
				self.addModel(model);
				/*
				var renderer = self.getItemRenderer();				
				itemView = renderer.create(self, item);
				self.appendItem(itemView);
				*/
			});
			
			return this;
	    },
	    unrender: function() {
	    	$(this.el).remove();
	    },
	    /*
	    appendView: function(view) {
	    	var tmp = view.render(); // usually tmp should equals view here
	    	var el = tmp.el;
	    	
	    	this.appendElement(el);
	    },
	    */
	    getItemRenderer: function() {
	    	return this.itemRenderer;
	    	//return this.options.itemRenderer;	    	
	    },

	    reset: function() {
	    	//console.log("Reset", arguments);
	    	this.$el.empty();
	    	//$(this.el).children().remove();
	    	this.render();
	    }
	});
	
	
	ns.ListView = ns.ListViewBase.extend({
	    appendElement: function(el) {
	    	$(this.el).append(el);
	    }
	});
	
	
	ns.ItemViewMapMarker = Backbone.View.extend({
		initialize: function() {

			//console.log('status', this);
			
			this.mapWidget = this.options.mapWidget;
			this.setElement(this.options.mapWidget.getElement());
			
			
			
			this.collection.bind('add', this.addModel, this);
			this.collection.bind('remove', this.removeModel, this);
			this.collection.bind('reset', this.clear, this);
		},
	
	    addModel: function(model) {
	    	var id = model.get("id").value;
	    	var label = model.get("label");
	    	var lonlat = model.get("lonlat");
	    	var attrs = {	    			
	    			abbr: model.get("abbr"),
	    			label: model.get("label")
	    	};
	    	var visible = true;
	    	//var state = this.model.get("isSelected");
	    	
	    	this.mapWidget.addItem(id, lonlat, attrs, visible);
	    	//addItem: function(id, lonlat, visible);
		
	    	/*
	    	var label = this.model.get("label");
	    	var state = this.model.get("isSelected");
	
	    	var stateStr = state ? "checked" : "";
	    	
	        $(this.el).html('<input type="checkbox" checked="' + stateStr + '"/><span>' + label + '</span>');
	        */
	        return this;
	    },
	    
	    removeModel: function(model) {
	    	this.mapWidget.removeItems(this.model.get("id"));
	    	
	    	//$(this.el).remove();
	    },

	    clear: function() {
	    	this.mapWidget.clearItems();
	    },
	    
	    destroy: function() {
	    	this.mapWidget.clearItems();
	    }
	});

		
		
	ns.ItemViewCheckbox = Backbone.View.extend({
		tagName: 'li',
		
		events: {
			/*
			'click span': function() {
				$(this.parent).trigger("click", {isChild: true, item: this, model: this.model});				
			}*/
		},
		
		initialize: function() {
			//this.parent = this.options.parent;
			
			/*
			if(!parent) {
				console.error("No parent container provided");
			}
			*/
			
			
			this.model.bind('change', this.render, this);
			this.model.bind('remove', this.unrender, this);
		},
	
	    render: function() {
	    	var label = this.model.get("label");
	    	var state = this.model.get("isSelected");
	
	    	var stateStr = state ? "checked" : "";
	    	
	        $(this.el).html('<input type="checkbox" checked="' + stateStr + '"/><span>' + label + '</span>');
	        return this;
	    },
	    
	    unrender: function() {
	    	$(this.el).remove();
	    },
	    
	    destroy: function() {
	    	this.unrender();
	    }
	});

	
	

	ns.ItemViewLabel = Backbone.View.extend({
		tagName: 'li',

		initialize: function() {
			this.model.on('change', this.render, this);
			this.model.on('remove', this.unrender, this);
		},
	
	    render: function() {
	    	var label = backboneUtils.getModelValue(this.model, "label", this.options.binding);
	    	//console.log("[ItemViewLabel] render(); Rerendering label: " + label);

	        this.$el.html('<span style="cursor: pointer;">' + stringUtils.escapeHTML(label) + '</span>');
	        
	        return this;
	    },
	    
	    unrender: function() {
	    	this.$el.remove();
	    }
	});
	

	/**
	 * A Renderer for selectable items, such as Checkbox-items
	 * 
	 * @param selectionModel
	 * @param fnId
	 * @param ctor
	 * @param binding
	 * @returns {ns.RendererItemView}
	 */
	ns.RendererItemView = function(selectionModel, fnId, ctor, binding) {
		this.selectionModel = selectionModel;
		this.fnId = fnId ? fnId : function(x) { return x.id; };
		this.ctor = ctor;
		this.binding = binding; // A mapping form model attributes to render attributes
	};
	
	ns.RendererItemView.prototype.create = function(model, parent) {
		var id = this.fnId(model);
		
		//console.debug("Rendering id: " + id);
		
		var itemView = new this.ctor({parent: parent, model: model, binding: this.binding});
		
		var result = itemView.render().el;
		
		return result;
	};
	
	
	
})(jQuery);
