import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import locations from '../../../../../../../router/locations'
import I18,{i18Get} from '../../../../../../../i18';
import utils from '../../../../../../../utils/utils';
import {Select,Input, Icon, Popconfirm, Button} from 'antd'
import workflowAction from '../../../../../../../actions/workflow'

// const numberOperations = ['+','-','*','/'];
const Option = Select.Option
const operands = ['EQUALS', 'NOT_EQUALS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_EQUAL_TO', 'GREATER_THAN_EQUAL_TO', 'STARTS_WITH', 'ENDS_WITH', 'CONTAINS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL']
const operations = {'PLUS':'+','MINUS':'-','MULTIPLY':'*','DIVIDE':'/'}
class Condition extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data:{},
            condition : this.props.condition,
            attributes: this.props.attributes,
            showOptions:false
        };
    }
    showOptions(e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        this.props.changeShowOptions(this.state.condition.key)
    }
    getCondition(condition) {
        return (
            <span className="">  
            {condition.lhs.function && condition.lhs.function.name && <span>{ condition.lhs.function.name + '('  + " "}</span>}
            {condition.lhs.operation &&  condition.lhs.operation.value && '('}
            <span className="bold">{(condition.lhs.value ? condition.lhs.value : '_') + " "}</span>
            {condition.lhs.operation && condition.lhs.operation.operand && <span>{operations[condition.lhs.operation.operand] + " "}</span>}
            {condition.lhs.operation && condition.lhs.operation.value &&  <span>{condition.lhs.operation.value + ") "}</span>}
            {condition.lhs.function && condition.lhs.function.name &&  ((condition.lhs.function.params0 ? ', ' + condition.lhs.function.params0 :'')+ (condition.lhs.function.params1 ? ', ' + condition.lhs.function.params1 :'') + ') ')}
            <span>{utils.toPascalCase(condition.operand.replace(/_/g,' ') + " ")}</span>
            <span className="bold">{condition.rhs.value ? condition.rhs.value : "_" + " "}</span>
            </span>
        )
    }
    
    render() {       
      return (
        <div className={`condition_card position_relative  `}> 
            {this.getCondition(this.state.condition)}
            {this.state.condition.invalidCondition &&  <span className="invalid_condition"><I18 tkey='Invalid condition' /></span>}
            <span className="float_right">
                <Icon onClick={this.showOptions.bind(this)} type="more" />
            </span>

            {this.props.showOptions === this.state.condition.key  && <div className="card_condition_more"   >
                <div className="pop-up-close"><Icon type="close" onClick={this.showOptions.bind(this)}/></div>
               <div> <Button className="card-condition-and card-condition-btn" onClick={this.props.addClicked.bind(this, this.state.condition, 'AND')}><I18 tkey="AND" /></Button></div>
               <div> <Button className="card-condition-or card-condition-btn" onClick={this.props.addClicked.bind(this, this.state.condition, 'OR')}><I18 tkey="OR" /></Button></div>
               {/* <Popconfirm title="Are you sure want to remove condition?" onConfirm={this.deleteClicked.bind(this)}  okText="Yes" cancelText="No">
                    <div> <Button className="card-condition-delete card-condition-btn"><I18 tkey="Delete"/> </Button></div>
                </Popconfirm> */}
                  <div><Popconfirm title="Are you sure want to remove condition?" onConfirm={this.deleteClicked.bind(this)}  okText="Yes" cancelText="No">
                    <Button className="card-condition-delete card-condition-btn"  ><I18 tkey="Delete" /></Button>
                </Popconfirm></div>
            </div>}
        </div>
        )
    }
    deleteClicked() {
        this.props.delete(this.state.condition)
    }
  
}   


Condition.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(connect(store => ({ 
    user: store.user,
    actions: store.actions,
    translations :store.translations,
    workflow : store.workflow
}))(Condition));
