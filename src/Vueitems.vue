<template>
    <div class="{{wrapperClass}}">
        <table class="vueitems {{tableClass}}">
            <thead>
                <tr>
                    <template v-for="field in fields">
                        <template v-if="field.visible">
                            <template v-if="isSpecialField(field.name)">
                                <th v-if="extractName(field.name) == '__checkbox'" class="vueitems-checkbox {{field.titleClass || ''}}">
                                    <input type="checkbox" @change="toggleAllCheckboxes($event.target.checked, field.name)">
                                </th>
                                <th v-else id="{{field.name}}" class="{{field.titleClass || ''}}">
                                    {{field.title || ''}}
                                </th>
                            </template>
                            <template v-else>
                                <th
                                    id="_{{field.name}}"
                                    class="{{field.titleClass || ''}}">
                                    {{getTitle(field) | capitalize}}&nbsp;
                                </th>
                            </template>
                        </template>
                    </template>
                </tr>
            </thead>
            <tbody v-cloak id="vueitems-list">
                <tr v-for="(itemNumber, item) in dataItems"
                    item-id="{{itemNumber}}"
                    @click="onRowClicked(item, $event)"
                    @dblclick="onRowDoubleClicked(item, $event)">
                    <template v-if="onRowChanged(item)"></template>
                    <template v-for="field in fields">
                            <template v-if="field.visible">
                                <template v-if="isSpecialField(field.name)">
                                    <td v-if="extractName(field.name) == '__handle'" class="vueitems-handle {{field.dataClass}}">
                                        <i class="sort-handle {{sortHandleIcon}}"></i>
                                    </td>
                                    <td v-if="extractName(field.name) == '__sequence'" class="vueitems-sequence {{field.dataClass}}"
                                        v-html="itemNumber+1">
                                    </td>
                                    <td v-if="extractName(field.name) == '__checkbox'" class="vueitems-checkbox {{field.dataClass}}">
                                        <input type="checkbox"
                                            @change="toggleCheckbox($event.target.checked, item, field.name)"
                                            :checked="isSelectedRow(item, field.name)">
                                    </td>
                                    <td v-if="field.name == '__actions'" class="vueitems-actions {{field.dataClass}}">
                                        <template v-for="action in itemActions">
                                            <button class="action-button {{ action.class }}" @click="callAction(action.name, item, itemNumber)" v-attr="action.extra">
                                                <i class="{{ action.icon }}"></i> {{ action.label }}
                                            </button>
                                        </template>
                                    </td>
                                    <td v-if="extractName(field.name) === '__component'" :class="field.dataClass">
                                        <component :is="extractArgs(field.name)" :row-data="item" :row-index="itemNumber"></component>
                                    </td>
                                </template>
                                <template v-else>
                                    <td v-if="hasCallback(field)" class="{{field.dataClass}}" @dblclick="onCellDoubleClicked(item, field, $event)">
                                        {{{ callCallback(field, item) }}}
                                    </td>
                                    <td v-else class="{{field.dataClass}}" @dblclick="onCellDoubleClicked(item, field, $event)">
                                        {{{ getObjectValue(item, field.name, "") }}}
                                    </td>
                                </template>
                            </template>
                        </template>
                </tr>
                <template v-if="lessThanMinRows">
                    <tr v-for="i in blankRows" class="blank-row">
                        <template v-for="field in fields">
                            <td v-if="field.visible">&nbsp;</td>
                        </template>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script>
export default {
    props: {
        wrapperClass: {
            type: String,
            default: 'vueitems-wrapper'
        },
        tableClass: {
            type: String,
            default: 'ui blue striped celled selectable single line attached table'
        },
        loaderWrapper: {
            type: String,
            default: null
        },
        loadingClass: {
            type: String,
            default: 'loading'
        },
        fields: {
            type: Array,
            required: true
        },
        dataItems: {
            type: Array,
            default: function () {
                return []
            }
        },
        itemActions: {
            type: Array,
            default: function () {
                return []
            }
        },
        selectedTo: {
            type: Array,
            default: function () {
                return []
            }
        },
        sortHandleIcon: {
            type: String,
            default: 'grey sidebar icon'
        },
        minRows: {
            type: Number,
            default: 0,
            coerce: function(value) {
                return parseInt(value)
            }
        },
    },
    data: function() {
        return {
            version: '0.1',
            eventPrefix: 'vueitems:',
        }
    },
    directives: {
        attr: {
            update: function(value) {
                for (var i in value) {
                    this.el.setAttribute(i, value[i])
                }
            }
        }
    },
    computed: {
        lessThanMinRows: function() {
            if (this.dataItems.length === 0) {
                return true
            }
            return this.dataItems.length < this.minRows
        },
        blankRows: function() {
            if (this.dataItems.length === 0) {
                return this.minRows
            }
            if (this.dataItems.length >= this.minRows) {
                return 0
            }

            return this.minRows - this.dataItems.length
        },
    },
    methods: {
        normalizeFields: function() {
            var self = this
            var obj
            this.fields.forEach(function(field, i) {
                var obj = null
                if (typeof (field) === 'string') {
                    obj = self.makeField(field)
                } else {
                    obj = self.makeField()
                    Object.keys(field).forEach(function(key) {
                        obj[key] = field[key]
                    })
                }

                if (obj.title.trim() === '' ) {
                    obj.title = self.setTitle(obj.name)
                }

                self.fields.$set(i, obj)
            })
        },
        makeField: function(fieldName) {
            fieldName = fieldName || ''
            return {
                name: fieldName,
                title: '',
                titleClass: '',
                dataClass: '',
                callback: null,
                visible: true
            }
        },
        setTitle: function(str) {
            if (this.isSpecialField(str)) {
                return ''
            }

            return this.titleCase(str)
        },
        titleCase: function(str)
        {
            return str.replace(/\w+/g, function(txt){
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            })
        },
        showLoadingAnimation: function(wrapper) {
            if (wrapper !== null) {
                this.addClass(wrapper, this.loadingClass)
            }
            this.dispatchEvent('loading')
        },
        hideLoadingAnimation: function(wrapper) {
            if (wrapper !== null) {
                this.removeClass(wrapper, this.loadingClass)
            }
            this.dispatchEvent('loaded')
        },
        getTitle: function(field) {
            return field.title
        },
        addClass: function(el, className) {
            if (el.classList)
                el.classList.add(className)
            else
                el.className += ' ' + className
        },
        removeClass: function(el, className) {
            if (el.classList)
                el.classList.remove(className)
            else
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
        },
        dispatchEvent: function(eventName, args) {
            this.$dispatch(this.eventPrefix + eventName, args)
        },
        isSpecialField: function(fieldName) {
            return fieldName.slice(0, 2) === '__'
        },
        hasCallback: function(field) {
            return field.callback ? true : false
        },
        callCallback: function(field, item) {
            if ( ! this.hasCallback(field))
                return

            var args = field.callback.split('|')
            var func = args.shift()

            if (typeof this.$parent[func] == 'function') {
                return (args.length > 0)
                    ? this.$parent[func].apply(this.$parent, [this.getObjectValue(item, field.name)].concat(args))
                    : this.$parent[func].call(this.$parent, this.getObjectValue(item, field.name))
            }

            return null
        },
        getObjectValue: function(object, path = '', defaultValue = null) {
                path = path.trim()

                var obj = object
                if (path != '') {
                    var keys = path.split('.')
                    keys.forEach(function(key) {
                        if (obj !== null && typeof obj[key] != 'undefined' && obj[key] !== null) {
                            obj = obj[key]
                        } else {
                            obj = defaultValue
                            return
                        }
                    })
                }
                return obj === null ? defaultValue : obj
        },
        callAction: function(action, data, index) {
            this.$dispatch(this.eventPrefix+'action', action, data, index)
        },
        toggleCheckbox: function(isChecked, dataItem, fieldName) {
            var idColumn = this.extractArgs(fieldName)
            if (idColumn === undefined) {
                console.warn('You did not provide reference id column with "__checkbox:<column_name>" field!')
                return
            }
            if (isChecked) {
                this.selectedTo.push(dataItem[idColumn])
            } else {
                this.selectedTo.$remove(dataItem[idColumn])
            }
        },
        toggleAllCheckboxes: function(isChecked, fieldName) {
            var self = this
            var idColumn = this.extractArgs(fieldName)

            if (isChecked) {
                this.dataItems.forEach(function(dataItem) {
                    if ( ! self.isSelectedRow(dataItem, fieldName)) {
                        self.selectedTo.push(dataItem[idColumn])
                    }
                })
            } else {
                this.dataItems.forEach(function(dataItem) {
                    self.selectedTo.$remove(dataItem[idColumn])
                })
            }
        },
        isSelectedRow: function(dataItem, fieldName) {
            return this.selectedTo.indexOf(dataItem[this.extractArgs(fieldName)]) >= 0
        },
        extractName: function(string) {
            return string.split(':')[0].trim()
        },
        extractArgs: function(string) {
            return string.split(':')[1]
        },
        setOptions: function(options) {
            for (var n in options) {
                this.$set(n, options[n])
            }
        },
        onRowChanged: function(dataItem) {
            this.dispatchEvent('row-changed', dataItem)
            return true
        },
        onRowClicked: function(dataItem, event) {
            this.$dispatch(this.eventPrefix+'row-clicked', dataItem, event)
            return true
        },
        onRowDoubleClicked: function(dataItem, event) {
            this.$dispatch(this.eventPrefix+'row-dblclicked', dataItem, event)
            return true
        },
        onCellDoubleClicked: function(dataItem, field, event) {
            this.$dispatch(this.eventPrefix+'cell-dblclicked', dataItem, field, event)
        },
    },
    events: {
        'vueitems:set-options': function(options) {
            this.setOptions(options)
        }
    },
    created: function() {
        this.normalizeFields()
    },
    compiled: function() {
        let wrapper = document.querySelector(this.loaderWrapper)
        this.showLoadingAnimation(wrapper)
    },
    ready: function() {
        let wrapper = document.querySelector(this.loaderWrapper)
        this.hideLoadingAnimation(wrapper)
    }
}
</script>

<style>

</style>
