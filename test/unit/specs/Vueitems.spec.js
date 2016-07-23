import Vue from 'vue'
import Vueitems from 'src/Vueitems'

describe('Vueitems.vue', () => {

  it('should parse basic array of fields definition correctly', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns"></vueitems>',
      components: { Vueitems },
      data: {
        columns: ['code', 'description']
      }
    }).$mount()
    let comp = vm.$children[0]
    expect(comp.fields).to.have.lengthOf(2)
    // deep equal does not work as expected in Safari
    // as it sees only Getter/Setter functions, not the real vulue
    // but deep equal works as expected on both Chrome and Firefox
    expect(comp.fields).to.satisfy(function(arr) {
      return (
          arr[0].name === 'code' &&
          arr[0].title === 'Code' &&
          arr[0].titleClass === '' &&
          arr[0].dataClass === '' &&
          arr[0].callback === null &&
          arr[0].visible
        ) && (
          arr[1].name === 'description' &&
          arr[1].title === 'Description' &&
          arr[1].titleClass === '' &&
          arr[1].dataClass === '' &&
          arr[1].callback === null &&
          arr[1].visible
        )
    })
    let nodes = comp.$el.querySelectorAll('table thead tr th')
    expect(nodes[0].attributes.id.value).to.equal('_code')
    expect(nodes[1].attributes.id.value).to.equal('_description')
  })

  it('should parse array of object of fields definition correctly', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [
          {
            name: 'code'
          }, {
            name: 'description'
          }
        ]
      }
    }).$mount()
    let comp = vm.$children[0]
    expect(comp.fields).to.have.lengthOf(2)
    expect(comp.fields).to.satisfy(function(arr) {
      return (
          arr[0].name === 'code' &&
          arr[0].title === 'Code' &&
          arr[0].titleClass === '' &&
          arr[0].dataClass === '' &&
          arr[0].callback === null &&
          arr[0].visible
        ) && (
          arr[1].name === 'description' &&
          arr[1].title === 'Description' &&
          arr[1].titleClass === '' &&
          arr[1].dataClass === '' &&
          arr[1].callback === null &&
          arr[1].visible
        )
    })
    let nodes = comp.$el.querySelectorAll('table thead tr th')
    expect(nodes[0].attributes.id.value).to.equal('_code')
    expect(nodes[1].attributes.id.value).to.equal('_description')
  })

  it('should set default field title to capitalized name', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [{
            name: 'code'
        }]
      }
    }).$mount()
    expect(vm.$children[0].fields[0].title).to.equal('Code')
  })

  it('should correctly override field title when specified', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [{
            name: 'code',
            title: 'My Title'
        }]
      }
    }).$mount()
    expect(vm.$children[0].fields[0].title).to.equal('My Title')
  })

})

/*
  data-items
 */
describe('data-items rendering', () => {
  describe('data-items does not contain given fields', () => {
    it('should return empty tbody', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr')
      expect(nodes).to.have.lengthOf(0)
    })
  })
})

/*
  callback
 */
describe('callback', () => {
  describe('callback function does not exist', () => {
    it('should return empty string when called', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [{
            name: 'code',
            callback: 'myCallback'
          }],
          dataItems: [{code: 'aaa'}],
        },
        methods: {
        }
      }).$mount()
      let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr td')
      expect(nodes[0].innerHTML.trim()).to.equal('')
    })
  })
  describe('try to call callback function of field that does not have callback function defined', () => {
    it('should result in undefined', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [{
            name: 'code'
          }],
          dataItems: [{code: 'aaa'}],
        }
      }).$mount()
      let result = vm.$children[0].callCallback({name: 'code', callback: null}, vm.dataItems[0])
      expect(result).to.be.undefined
    })
  })
  describe('callback function without argument', () => {
    it('should call the given callback function and gets back correct value', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [{
            name: 'code',
            callback: 'myCallback'
          }],
          dataItems: [{code: 'aaa'}],
        },
        methods: {
          myCallback: (value) => {
            return value.toUpperCase()
          }
        }
      }).$mount()
      let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr td')
      expect(nodes[0].innerHTML.trim()).to.equal('AAA')
    })
  })
  describe('callback function with additional argument', () => {
    it('should call given callback function with additional argument and returns correct value', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [{
            name: 'code',
            callback: 'myCallbackWithArgument|1234'
          }],
          dataItems: [{code: 'aaa'}],
        },
        methods: {
          myCallbackWithArgument: (value, arg) => {
            return value.toUpperCase() + arg
          }
        }
      }).$mount()
      let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr td')
      expect(nodes[0].innerHTML.trim()).to.equal('AAA1234')
    })
  })
})


describe('special fields', () => {
  it('should not render special field if no data-items is given', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [
          { name: '__handle' },
          "code"
        ],
      }
    }).$mount()
    let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr td')
    expect(nodes.length).to.equal(0)
  })

  describe('__handle', () => {
    it('should render handle column correctly', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [
            { name: '__handle' },
            "code"
          ],
          dataItems: [{code: 'aaa'}],
        }
      }).$mount()
      let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr td')
      expect(nodes[0].className.trim()).to.equal('vueitems-handle')
    })
  })

  describe('__sequence', () => {
    it('should render sequence column correctly', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [
            { name: '__sequence' },
            "code"
          ],
          dataItems: [{code: 'aaa'},{code: 'bbb'}],
        }
      }).$mount()
      let nodes = vm.$children[0].$el.querySelectorAll('table tbody tr td.vueitems-sequence')
      expect(nodes[0].innerHTML.trim()).to.equal('1')
      expect(nodes[1].innerHTML.trim()).to.equal('2')
    })
  })

  describe('__checkbox and selectedTo', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [
          { name: '__checkbox:id' },
          "code"
        ],
        dataItems: [{id: 1, code: 'aaa'},{id: 2, code: 'bbb'}],
        fieldName: '__checkbox:id'
      }
    }).$mount()
    let comp = vm.$children[0]

    it('should render checkbox on the table header', () => {
      let nodes = comp.$el.querySelectorAll('table thead tr th')
      expect(nodes[0].className.trim()).to.equal('vueitems-checkbox')
      expect(nodes[0].querySelectorAll('input[type=checkbox]')).to.have.lengthOf(1)
    })

    it('should render checkboxes on the table body', () => {
      let nodes = comp.$el.querySelectorAll('table tbody tr td.vueitems-checkbox')
      expect(nodes).to.have.lengthOf(2)
      expect(nodes[0].querySelectorAll('input[type=checkbox]')).to.have.lengthOf(1)
      expect(nodes[1].querySelectorAll('input[type=checkbox]')).to.have.lengthOf(1)
    })

    it('should toggle all checkboxes when clicks the checkbox on table header', () => {
      expect(comp.selectedTo).to.have.lengthOf(0)
      // simulate click to select
      comp.toggleAllCheckboxes(true, vm.fieldName)
      expect(comp.selectedTo).to.have.lengthOf(2)
      expect(comp.isSelectedRow(vm.dataItems[0], vm.fieldName)).to.be.true
      expect(comp.isSelectedRow(vm.dataItems[1], vm.fieldName)).to.be.true
      expect(comp.selectedTo).to.deep.equal([1, 2])

      // simulate force click to check for duplication
      comp.toggleAllCheckboxes(true, vm.fieldName)
      expect(comp.selectedTo).to.have.lengthOf(2)
      expect(comp.selectedTo).to.deep.equal([1, 2])

      // simulate another click to deselect
      comp.toggleAllCheckboxes(false, vm.fieldName)
      expect(comp.selectedTo).to.have.lengthOf(0)
    })

    it('should toggle the checkbox when click the checkbox on table body', () => {
      // deselect everything
      comp.toggleAllCheckboxes(false, vm.fieldName)
      expect(comp.selectedTo).to.have.lengthOf(0)
      // select a row
      comp.toggleCheckbox(true, vm.dataItems[0], vm.fieldName)
      expect(comp.selectedTo).to.deep.equal([1])
      expect(comp.isSelectedRow(vm.dataItems[0], vm.fieldName)).to.be.true
      expect(comp.isSelectedRow(vm.dataItems[1], vm.fieldName)).to.be.false
      // deselect it
      comp.toggleCheckbox(false, vm.dataItems[0], vm.fieldName)
      expect(comp.selectedTo).to.have.lengthOf(0)
    })

    it('should give warning when not specifying "id" parameter', () => {
      sinon.spy(console, 'warn')

      comp.toggleCheckbox(true, vm.dataItems[0], '__checkbox')
      expect(console.warn).to.have.been.calledWith('You did not provide reference id column with "__checkbox:<column_name>" field!')
    })
  })

  describe('__actions', () => {

    it('should render empty action column when item-actions prop was not defined or given', () => {
      const vm = new Vue({
        template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
        components: { Vueitems },
        data: {
          columns: [
            { name: '__actions' },
            "code"
          ],
          dataItems: [{id: 1, code: 'aaa'},{id: 2, code: 'bbb'}],
        }
      }).$mount()
      let comp = vm.$children[0]
      let nodes = comp.$el.querySelectorAll('table tbody tr td.vueitems-actions')
      expect(nodes[0].querySelectorAll('button.action-button')).to.have.lengthOf(0)
    })

    const vm = new Vue({
      template: '<vueitems :fields="columns" :data-items="dataItems" :item-actions="itemActions"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [
          { name: '__actions' },
          "code"
        ],
        dataItems: [{id: 1, code: 'aaa'},{id: 2, code: 'bbb'}],
        itemActions: [
            { name: 'edit-item', label: 'Edit', icon: 'large edit icon', class: 'ui teal basic mini button'},
            { name: 'delete-item', label: '', icon: 'large delete icon', class: 'ui red basic mini button', extra: {title: 'Tooltip text', 'dummy-attr': 'dummy value'} }
        ],
        clickedAction: '',
        selectedItem: null
      },
      events: {
        'vueitems:action': (action, item) => {
          vm.clickedAction = action
          vm.selectedItem = item
        }
      }
    }).$mount()
    let comp = vm.$children[0]
    let nodes = comp.$el.querySelectorAll('table tbody tr td.vueitems-actions')
    let buttons = nodes[0].querySelectorAll('button.action-button')

    it('should render action buttons correctly', () => {
      expect(nodes.length).to.equal(2)
      expect(buttons).to.have.lengthOf(2)
    })

    it('should apply css class for button correctly', () => {
      expect(buttons[0].className).to.equal('action-button ui teal basic mini button')
      expect(buttons[1].className).to.equal('action-button ui red basic mini button')
    })

    it('should apply css class for icon correctly', () => {
      expect(buttons[0].querySelector('i.large.edit.icon')).to.exist
      expect(buttons[1].querySelector('i.large.delete.icon')).to.exist
    })

    it('should apply button label correctly', () => {
      expect(buttons[0].textContent.trim()).to.equal('Edit')
      expect(buttons[1].textContent.trim()).to.equal('')
    })

    it('should render extra attributes (using v-attr directive) correctly', () => {
      expect(buttons[1].getAttribute('title')).to.equal('Tooltip text')
      expect(buttons[1].getAttribute('dummy-attr')).to.equal('dummy value')
    })

    it('should dispatch vueitems:action event', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:action', spy)
      comp.callAction('edit-item', vm.dataItems[1])
      expect(spy).to.have.been.calledOnce
    })

    it('should call vueitem:action event function with correct argument', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:action', spy)
      comp.callAction('delete-item', vm.dataItems[0])
      expect(spy).to.have.been.calledWith('delete-item', vm.dataItems[0])
      expect(vm.clickedAction).to.equal('delete-item')
      expect(vm.selectedItem).to.deep.equal(vm.dataItems[0])
    })
  })
})

describe('events', () => {
  const vm = new Vue({
    template: '<vueitems :fields="columns" :data-items="dataItems"></vueitems>',
    components: { Vueitems },
    data: {
      columns: ['code'],
      dataItems: [{code: 'aaa'},{code: 'bbb'}]
    }
  }).$mount()
  let comp = vm.$children[0]

  describe('#loading', () => {
    it('should dispatch loading event', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:loading', spy)

      comp.dispatchEvent('loading')
      expect(spy).to.have.been.calledOnce
    })
  })
  describe('#loaded', () => {
    it('should dispatch loaded event', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:loaded', spy)

      comp.dispatchEvent('loaded')
      expect(spy).to.have.been.calledOnce
    })
  })
  // describe('#action')
  describe('#row-changed', () => {
    it('should dispatch row-changed event', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:row-changed', spy)

      comp.onRowChanged(vm.dataItems[0])
      expect(spy).to.have.been.calledOnce
    })
  })
  describe('#row-clicked', () => {
    it('should dispatch row-clicked event', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:row-clicked', spy)

      comp.onRowClicked(vm.dataItems[0])
      expect(spy).to.have.been.calledOnce
    })
  })
  describe('#cell-dblclicked', () => {
    it('should dispatch cell-dblclicked event', () => {
      let spy = sinon.spy()
      vm.$on('vueitems:cell-dblclicked', spy)

      comp.onCellDoubleClicked(vm.dataItems[0])
      expect(spy).to.have.been.calledOnce
    })
  })
  describe('#set-options', () => {
    it('should call setOptions()', () => {
      let spy = sinon.spy()
      comp.$on('vueitems:set-options', spy)

      vm.$broadcast('vueitems:set-options', {tableClass: 'my-table-class'})
      expect(spy).to.have.been.calledWith({tableClass: 'my-table-class'})
    })
  })
})

/*
  Other optional props
 */
describe('Vueitems optional props setting', () => {
  describe('wrapper-class', () => {
    it('should return null when "wrapper-class" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].wrapperClass).to.equal('vueitems-wrapper')
    })

    it('should return the correct value when "wrapper-class" prop was set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" wrapper-class="something here"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].wrapperClass).to.equal('something here')
    })
  })

  describe('loader-wrapper', () => {
    it('should return null when "loader-wrapper" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].loaderWrapper).to.be.null
    })

    it('should return the correct value when "loader-wrapper" prop was set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" loader-wrapper="something here"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].loaderWrapper).to.equal('something here')
    })
  })

  describe('table-class', () => {
    it('should return default value when "table-class" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].tableClass).to.equal('ui blue striped celled selectable single line attached table')
    })

    it('should return the correct value when "table-class" prop was set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" table-class="something here"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].tableClass).to.equal('something here')
    })
  })

  describe('loading-class', () => {
    it('should return default value when "loading-class" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].loadingClass).to.equal('loading')
    })

    it('should return the correct value when "loading-class" prop was set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" loading-class="something here"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].loadingClass).to.equal('something here')
    })
  })

  describe('sort-handle-icon', () => {
    it('should return default value when "sort-handle-icon" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].sortHandleIcon).to.equal('grey sidebar icon')
    })

    it('should return the correct value when "sort-handle-icon" prop was set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" sort-handle-icon="something here"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].sortHandleIcon).to.equal('something here')
    })
  })

  describe('min-rows', () => {
    it('should return 0 when "min-rows" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].minRows).to.equal(0)
    })

    it('should return the correct value when "min-rows" prop was set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" min-rows="5"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].minRows).to.equal(5)
    })
  })
})

describe('Vueitems computed props', () => {
  describe('#lessThanMinRows', () => {
    it('should return true when "data-items" prop was not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" min-rows="5"></vueitems>',
        components: { Vueitems }
      }).$mount()
      expect(vm.$children[0].lessThanMinRows).to.be.true
    })

    it('should return true when length of "data-items" < "min-rows"', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" :data-items="dataItems" min-rows="5"></vueitems>',
        components: { Vueitems },
        data: {
          dataItems: [{ code: 'aaa' }, { code: 'bbb' }]
        }
      }).$mount()
      expect(vm.$children[0].lessThanMinRows).to.be.true
    })

    it('should return false when length of "data-items" === "min-rows"', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" :data-items="dataItems" min-rows="2"></vueitems>',
        components: { Vueitems },
        data: {
          dataItems: [{ code: 'aaa' }, { code: 'bbb' }]
        }
      }).$mount()
      expect(vm.$children[0].lessThanMinRows).to.be.false
    })

    it('should return false when length of "data-items" > "min-rows"', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" :data-items="dataItems" min-rows="2"></vueitems>',
        components: { Vueitems },
        data: {
          dataItems: [{ code: 'aaa' }, { code: 'bbb' }, { code: 'ccc' }]
        }
      }).$mount()
      expect(vm.$children[0].lessThanMinRows).to.be.false
    })
  })

  describe('#blankRows', () => {
    it('should return min-rows value when length of "data-items" was empty or not set', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" min-rows="2"></vueitems>',
        components: { Vueitems },
      }).$mount()
      expect(vm.$children[0].blankRows).to.equal(2)
    })

    it('should return 0 when length of "data-items" === "min-rows"', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" :data-items="dataItems" min-rows="2"></vueitems>',
        components: { Vueitems },
        data: {
          dataItems: [{ code: 'aaa' }, { code: 'bbb' }]
        }
      }).$mount()
      expect(vm.$children[0].blankRows).to.equal(0)
    })

    it('should return 0 when length of "data-items" > "min-rows"', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" :data-items="dataItems" min-rows="2"></vueitems>',
        components: { Vueitems },
        data: {
          dataItems: [{ code: 'aaa' }, { code: 'bbb' }, { code: 'ccc' }]
        }
      }).$mount()
      expect(vm.$children[0].blankRows).to.equal(0)
    })

    it('should return correct value when length of "data-items" < "min-rows"', () => {
      const vm = new Vue({
        template: '<vueitems :fields="[\'code\']" :data-items="dataItems" min-rows="5"></vueitems>',
        components: { Vueitems },
        data: {
          dataItems: [{ code: 'aaa' }, { code: 'bbb' }]
        }
      }).$mount()
      expect(vm.$children[0].blankRows).to.equal(3)
    })
  })
})

describe('Vueitems internal methods', () => {
  const vm = new Vue({
    template: '<div class="ui segment"><vueitems :fields="columns"></vueitems></div>',
    components: { Vueitems },
    data: {
      columns: ['code']
    }
  }).$mount()
  let comp = vm.$children[0]

  describe('#setTitle', () => {
    it('should return capitalized words title', () => {
      expect(comp.setTitle('hello world')).to.equal('Hello World')
    })

    it('should return empty string for special field name', () => {
      expect(comp.setTitle('__actions')).to.equal('')
    })
  })

  describe('#titleCase()', () => {
    it('should return capitalized words of the given value', () => {
      expect(comp.titleCase('helloworld')).to.equal('Helloworld')
      expect(comp.titleCase('hello world')).to.equal('Hello World')
    })
  })

  describe('#isSpecialField()', () => {
    it('should return true when the given value starts with "__"', () => {
      expect(comp.isSpecialField('__fieldname')).to.be.true
    })

    it('should return false when the given value does not start with "__"', () => {
      expect(comp.isSpecialField('fieldname')).to.be.false
    })
  })

  describe('#hasCallback()', () => {
    const vm = new Vue({
      template: '<vueitems :fields="columns"></vueitems>',
      components: { Vueitems },
      data: {
        columns: [{ name: 'code', callback: 'myCallback'},{ name: 'desc'}]
      },
      methods: {
        myCallback: () => {
          return 'ok'
        }
      }
    }).$mount()

    let comp = vm.$children[0]

    it('should return true when the given field has a callback function', () => {
      expect(comp.hasCallback(comp.fields[0])).to.be.true
    })

    it('should return false when the given field does not have a callback function', () => {
      expect(comp.hasCallback(comp.fields[1])).to.be.false
    })
  })

  describe('#extractName()', () => {
    it('should extract the first part of ":" colon delimited string', () => {
      expect(comp.extractName('aa:bb,cc')).to.equal('aa')
    })
  })

  describe('#extractArgs()', () => {
    it('should extract the second part of ":" colon delimited string', () => {
      expect(comp.extractArgs('aa:bb,cc')).to.equal('bb,cc')
    })
  })

  describe('#setOptions()', () => {
    it('should override existing options correctly', () => {
      comp.setOptions({tableClass: 'my-table-class', minRows: 10})
      expect(comp.tableClass).to.equal('my-table-class')
      expect(comp.minRows).to.equal(10)
    })
  })

  describe('#getObjectValue()', () => {
    const obj = { code: 'aaa' }
    it('should return correctly value inside the given object', () => {
      let result = comp.getObjectValue(obj, 'code')
      expect(result).to.equal('aaa')
    })
    it('should return null when given path does not exist and no default value is given', () => {
      let result = comp.getObjectValue(obj, 'foo')
      expect(result).to.be.null
    })
    it('should return default value when the given path does not exist and default value is given', () => {
      let result = comp.getObjectValue(obj, 'foo', 'bar')
      expect(result).to.equal('bar')
    })
    it('should return the object when an empty path is given without default value', () => {
      let result = comp.getObjectValue(obj, '')
      expect(result).to.equal(obj)
    })
    it('should return the object when an empty path is given even though the default value is given', () => {
      let result = comp.getObjectValue(obj, '', 'foo')
      expect(result).to.equal(obj)
    })
  })

  describe('#addClass()', () => {
    it('should be able to add given class to the DOM element when "class" attribute was not exist', () => {
      let el = document.createElement('div')

      comp.addClass(el, 'foo-class')
      expect(el.getAttribute('class')).to.equal('foo-class')
    })
    it('should be able to add given class to the DOM element when "class" attribute already existed', () => {
      let el = document.createElement('div')
      el.classList.add('foo-class')

      comp.addClass(el, 'bar-class')
      expect(el.classList.contains('bar-class')).to.be.true
    })
  })

  describe('#removeClass()', () => {
    it('should be able to remove exiting class from the DOM element', () => {
      let el = document.createElement('div')
      el.classList.add('foo-class')

      comp.removeClass(el, 'foo-class')
      expect(el.classList.contains('foo-class')).to.be.false
    })
  })

  describe('#showLoadingAnimation()', () => {
    it('should just dispatch loading event when wrapper is null', () => {
      sinon.spy(comp, 'dispatchEvent')

      comp.showLoadingAnimation(null)
      expect(comp.dispatchEvent).to.have.been.calledWith('loading')
    })
    it('should add loading class and dispatch loading event', () => {
      let wrapper = document.createElement('div')
      expect(wrapper).not.to.be.null

      sinon.spy(comp, 'addClass')

      comp.showLoadingAnimation(wrapper)
      expect(comp.addClass).to.have.been.calledWith(wrapper, comp.loadingClass)
      expect(comp.dispatchEvent).to.have.been.calledWith('loading')
    })
  })

  describe('#hideLoadingAnimation()', () => {
    it('should only dispatch loaded event when wrapper is null', () => {
      comp.hideLoadingAnimation(null)
      expect(comp.dispatchEvent).to.have.been.calledWith('loaded')
    })
    it('should remove loading class and dispatch loaded event', () => {
      let wrapper = document.createElement('div')
      expect(wrapper).not.to.be.null

      sinon.spy(comp, 'removeClass')

      comp.hideLoadingAnimation(wrapper)
      expect(comp.removeClass).to.have.been.calledWith(wrapper, comp.loadingClass)
      expect(comp.dispatchEvent).to.have.been.calledWith('loaded')
    })
  })
})
