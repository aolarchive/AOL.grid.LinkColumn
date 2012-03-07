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
 * <p>A rowSelectEvent should be defined, this is the name of the event that
 * will be fired when the user selects the entire row. A standard 'rowselect'
 * event will be fired on the selection model as well.</p>
 * <pre><code>
 {
     xtype: 'grid',
     plugins: [{
         ptype: 'aol-linkcolumn',
         rowSelectEvent: 'viewlink',
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
 * <p>This is an example of using a renderer to change the link text:</p>
 * <pre><code>
 plugins: [{
     ptype: 'aol-linkcolumn',
     rowSelectEvent: 'viewlink',
     links: [
         [function(v,m,rec,ri,ci,store,plg){
             var txt = '';
             if (rec.data.status == 'invalid') {
                txt = 'Fix!';
             }else{
                txt = 'Edit';
             }
             return String.format(plg.renderString,plg.linkClass,'editlink',txt);
         },'editlink'],
         ['View','viewlink']
     ]
 }],
 * </code></pre>
 */
AOL.grid.LinkColumn = Ext.extend(Ext.util.Observable, {
    // private
    constructor: function(config){
        Ext.apply(this, config);
        AOL.grid.LinkColumn.superclass.constructor.call(this, config);
    },
    /**
     * The position of the Link Column within the grid column model, available
     * options are 'last', 'first' or the numeric index of the position. 
     * (defaults to 'last')
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
     * column. See overall example for appropriate syntax. A renderer function
     * can also be used in place of the text, this will be passed the current
     * record (along with the same arguments a column renderer receives, plus an
     * additional argument with a reference to the plugin) and should return the
     * text to display.
     * @cfg {Array} links
     */
    /**
     * An event (one of the events provided in the links array) that will select
     * the row in the grid. Also, this event will be fired upon row selection
     * in the grid.
     * @cfg {String} rowSelectEvent
     */
    /**
     * The width of the link column (only needed when a renderer is used).
     * @cfg {Number} columnWidth
     */
    columnWidth: 120,
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
    /**
     * The default link rendering string (using string format) 0 = class,
     * 1 = eventname, 2 = display text
     * @cfg {String} renderString
     */
    renderString: '<a class="{0}" action="{1}">{2}</a>',
    /**
     * Indicates if the link column can be resized. (defaults to true)
     * @cfg {Boolean} resizable
     */
    resizable: true,
    // private
    init: function(cmp){
        this.links = this.links || [];
        this.newcollinks = '';
        var newcol = {
            header: this.columnHeader,
            sortable: false,
            id: 'actioncol',
            hideable: false,
            menuDisabled: true,
            fixed: true,
            resizable: this.resizable
        }, measureEl = Ext.get(this.measureElId), textSize = {
            width: 100
        }, renderer = function(){
            return this.newcollinks;
        }, hasTextRenderer = false;
        // if a measurement element does not exist, create it at the end of the dom.
        if (!measureEl) {
            measureEl = Ext.DomHelper.append(Ext.getBody(), {
                id: this.measureElId,
                cls: this.linkClass
            });
        }
        this.cmp = cmp;
        this.cmp.on('click', this.onCellClick, this);
        // loop through the links and create the html fragment used for the cell.
        Ext.each(this.links, function(lnk, i){
            this.cmp.addEvents(lnk[1]);
            if (!Ext.isFunction(lnk[0])) {
                this.links[i][2] = false;
                this.newcollinks = this.newcollinks + String.format(this.renderString, this.linkClass, lnk[1], lnk[0]);
            } else {
                this.links[i][2] = true;
                hasTextRenderer = true;
            }
        }, this);
        if (hasTextRenderer) {
            renderer = function(v, m, rec, ri, ci, store){
                var collinks = '', lnktext = '';
                Ext.each(this.links, function(lnk, i){
                    if (lnk[2] === true) {
                        lnktext = lnk[0](v, m, rec, ri, ci, store, this);
                    } else {
                        lnktext = String.format(this.renderString, this.linkClass, lnk[1], lnk[0]);
                    }
                    collinks = collinks + lnktext;
                }, this);
                return collinks;
            };
        }
        // setup the column def and actually measure the fragment of html to set the column width if needed
        Ext.apply(newcol, {
            width: (hasTextRenderer) ? this.columnWidth : Ext.util.TextMetrics.measure(measureEl, this.newcollinks).width + 20,
            renderer: renderer,
            scope: this,
            destroy: Ext.emptyFn,
            editable: false
        });
        // add our new link/action column to the column model of the grid.
        if (this.columnPosition == 'last') {
            this.cmp.colModel.config.push(newcol);
            return;
        }
        if (this.columnPosition == 'first') {
            this.cmp.colModel.config.unshift(newcol);
            return;
        }
        //check if column position is number
        if (!isNaN(this.columnPosition)){
            this.cmp.colModel.config.splice(this.columnPosition, 0, newcol);
        }
        
    },
    // private
    onCellClick: function(e){
    
        // TODO: this does not seem to fix getCellEditor errors like I expected it to - research this more
        //e.preventDefault();
        
        var el = e.getTarget(), action = el.getAttribute('action'), sm = this.cmp.getSelectionModel(), i = this.cmp.getView().findRowIndex(el);
        
        // ignore this click if it came from a grid header
        if (!Ext.fly(el).hasClass('x-grid3-hd-inner')) {
            if (action) {
                //check for disableSelection config
                //if its set to true then dont even bother selecting the row
                if (!this.cmp.disableSelection) {
                    sm.selectRow(i, false, true);
                }
                (function(){
                    if (this.cmp && this.cmp.rendered) {
                        this.cmp.fireEvent(action, this.cmp, i);
                    }
                }).defer(50, this);
            } else {
                if (this.rowSelectEvent) {
                    this.cmp.fireEvent(this.rowSelectEvent, this.cmp, i);
                }
            }
        }
    }
    
});

Ext.preg('aol-linkcolumn', AOL.grid.LinkColumn);
