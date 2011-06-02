Ext.ns('AOL.grid');
/**
 * @class AOL.grid.LinkColumn
 * @extends Ext.util.Observible
 * @compatible ExtJS 3.x
 * <p>This is a plugin that adds a Link (or actions) Column to any grid. This
 * column can have any number of links that will fire different events when 
 * clicked.</p>
 * <p>The following example would create two links in an "Action" column, one for 
 * Edit and one for View. These two links would fire off their respective events
 * when clicked, 'Edit' would fire the 'editlink' event passing the row index
 * as the 2nd argument (a grid reference being the first):</p>
 * <pre><code>
 {
    xtype: 'grid',
    plugins: [{
        ptype: 'aol-linkcolumn',
        links: [
            ['Edit','editlink'],
            ['View','viewlink']
        ]
    }],   
    listeners: {
        editlink: function(grid,i){
            this.editLink(i);
        },
        viewlink: function(grid, i){
            this.viewLink(i);
        },
        scope: this
    }
 }
 * </code></pre>
 */
AOL.grid.LinkColumn = Ext.extend(Ext.util.Observable, {
    // private
    constructor: function(config){
        Ext.apply(this,config);
        AOL.grid.LinkColumn.superclass.constructor.call(this, config);
    },
    /**
     * The position of the Link Column within the grid column model, available 
     * options are 'last', with 'first' and an index coming to a later version.
     * @cfg {String} columnPosition
     */
    columnPosition: 'last',
    /**
     * The text to display in the Actions column heading.
     * @cfg {String} columnHeader
     */
    columnHeader: 'Actions',
    /**
     * An array of text and event pair arrays to use as the links in the Action 
     * column. See overall example for appropriate syntax.
     * @cfg {Array} links
     */
    /**
     * The id of a hidden element which is used for measuring the width of 
     * text used in setting the Action columns width.
     * @cfg {String} measureElId
     */
    measureElId: 'measureel',
    /**
     * The class to be added to each of the links in the action column (also 
     * used in the measuring of text width - ie: padding/font/etc. is included)
     * @cfg {String} linkClass
     */
    linkClass: 'actionlink',
    // private
    init: function(cmp){
        this.links = this.links || [];
        var newcol = {
            header: this.columnHeader,
            headerDisabled: true,
            hideable: false,
            menuDisabled: true,
            sortable: false
        }, newcollinks = '', measureEl = Ext.get(this.measureElId), textSize = {
            width: 100
        }, fn;
        // if a measurement element does not exist, create it at the end of the dom.
        if (!measureEl){
            measureEl = Ext.DomHelper.append(Ext.getBody(),{id:this.measureElId,cls:this.linkClass});
        }
        this.cmp = cmp;
        this.cmp.on('click', this.onCellClick, this);
        // loop through the links and create the html fragment used for the cell.
        Ext.each(this.links, function(lnk,i){
            this.cmp.addEvents(lnk[1]);
            newcollinks = newcollinks + '<a class="'+this.linkClass+'" action="'+lnk[1]+'">'+lnk[0]+'</a>';
        },this);
        // actually measure the fragment of html to set the column width
        textSize = Ext.util.TextMetrics.measure(measureEl,newcollinks);
        // create a simple closure function that renders the link fragment to all of the rows.
        fn = function(){
            return newcollinks;
        };
        newcol.width = textSize.width+20;
        newcol.renderer = fn;
        // add our new link/action column to the column model of the grid.
        if (this.columnPosition == 'last'){
            this.cmp.gridColumns.push(newcol);
        }
    },
    // private
    onCellClick: function(e){
        var el = e.getTarget(), action = el.getAttribute('action');
        if (action){
            this.cmp.fireEvent(action,this.cmp,this.cmp.getView().findRowIndex(el));
        }
    }
});

Ext.preg('aol-linkcolumn',  AOL.grid.LinkColumn);
