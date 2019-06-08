import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes, { number } from 'prop-types';
import { withRouter } from 'react-router';
import locations from '../../../../../../../router/locations'
import I18,{i18Get} from '../../../../../../../i18';
import utils from '../../../../../../../utils/utils';
import {Select, Modal, Input, Button, Icon, Popconfirm, Radio} from 'antd'
import constants from '../../../../../../../constants/condition-functions.json';
import ConditionEdit from './edit-conditions'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
// const numberOperations = ['+','-','*','/'];
const Option = Select.Option
const operands = ['EQUALS', 'NOT_EQUALS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_EQUAL_TO', 'GREATER_THAN_EQUAL_TO', 'STARTS_WITH', 'ENDS_WITH', 'CONTAINS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL']
const operations = ['PLUS','MINUS','MULTIPLY','DIVIDE'];
const VALUE = 'VALUE';
const COLUMN = 'COLUMN';

class Condition extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data:{},
            condition : this.props.condition
        };
    }
    componentWillMount() {
        this.state.condition.rhs.type = !this.props.attributesRhs.length ? VALUE : this.state.condition.rhs.type
    }

   
    onAttributeChange(label, e) {
        let value = e.substring(e.indexOf('-aliasID-')+9, e.length);
        let alias = e.substring(0, e.indexOf('-aliasID-'));
        let prevState = this.state;
        prevState.condition[label].value = value; 
        prevState.condition[label].selectedValue = e;
        let invalid = label ==='lhs' ? 'invalidLhs' : 'invalidRhs';      
        prevState.condition[label].source_alias = alias;
        delete prevState.condition[label].operation;
        delete prevState.condition[label].function;
        this.props.onChange(prevState.condition, invalid);
        this.setState(prevState);
    }
    onOperationChange(side, e) {
        let prevState = this.state;
        prevState.condition[side].operation = {}
        prevState.condition[side].operation.operand = e;
        prevState.condition[side].operation.valueType = 'VALUE';
        this.props.onChange(prevState.condition,`invalid${side}Operation`)
        this.setState(prevState)
    }
    onFunctionChange(side, e) {
        let prevState = this.state;
        prevState.condition[side].function = {}
        prevState.condition[side].function.name = e;
        prevState.condition[side].function.params1 = '';
        prevState.condition[side].function.params2 = '';
        prevState.condition[side].function.params3 = '';
        this.props.onChange(prevState.condition,`invalid${side}Function`)
        this.setState(prevState)
    }
    onOperationVal(side, e) {
        let prevState = this.state;
        prevState.condition[side].operation.value = e.target.value;
        this.props.onChange(prevState.condition,`invalid${side}Operation`)
        this.setState(prevState)
    }
    onOperandChange(e) {
        let prevState = this.state;
        prevState.condition.operand = e;
        this.props.onChange(prevState.condition, 'invalidOperand')
        this.setState(prevState)
    }
  
    getAttributes(listSide) {
        if(listSide === 'lhs') {
            return this.props.attributes.map(d => {
                return <Option key={`${d.source_alias}-aliasID-${d.name}`} >{d.name +`${d.source_name ? ` (${d.source_name})`:''}`}</Option>
            })
        } else {
            return this.props.attributesRhs.map(d => {
                return <Option key={`${d.source_alias}-aliasID-${d.name}`} >{d.name +`${d.source_name ? ` (${d.source_name})` : ''}`}</Option>
            })
        }
    }
    valueChanges(e) {
        let prevState = this.state;
        prevState.condition.rhs.value = e.target.value;
        this.props.onChange(prevState.condition, 'invalidRhs')
        this.setState(prevState)
    }
    getOperands() {
        return operands.map(d => {
            return <Option key={d}>{utils.toPascalCase(d.replace(/_/g,' '))}</Option>
        })
    }

    getType(value) {
        let type = ''
        this.props.attributes.map(d => {
            if(d.name === value) {
               type = d.type; 
            }
        })
        return type;
    }
    getOperations() {
        return operations.map(d => {
            return <Option key={d} >{utils.toPascalCase(d)}</Option>
        })
    }
    getNumberFunctions() {
        return constants.numberFunctions.map(d => {
            return <Option key={d.name} >{d.name}</Option>
        })
    }
    getStringFunctions() {
        return constants.stringFunctions.map(d => {
            return <Option key={d.name} >{d.name}</Option>
        })
    }
    getOperationColumn(side) {
        return ( 
            <div className="col-md-offset-2 col-md-7">
            <div className="w_135 " ><label className="margin-bottom-0 edit_condition_label"><I18 tkey='Operation' /></label></div>
            <div className="opretion_case">
            {this.state.condition['invalid'+side+'Operation'] && <span className='invalid condition_edit_invalid fixed_label'><I18 tkey="Invalid operation" /></span>}
            <div className="display_flex align_items_center position_relative">
                <div className="width_select_condition ">
                    <Select                    
                        id="lhs"
                        value={this.state.condition[side].operation ? this.state.condition[side].operation.operand : false}
                        className="w_100"
                        defaultActiveFirstOption={false}
                        onChange={this.onOperationChange.bind(this, side)}
                        placeholder={i18Get('Select operation', utils.getLanguage())}
                        notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                        {this.getOperations()}
                    </Select>       
                </div>
                <div className="width_select_condition position_relative  ">
                    {this.state.invalidOperationVal && <span className='invalid user_invalid fixed_label'><I18 tkey="Enter value" /></span>}
                    <Input id="l_val" maxLength='45'   type="number" onChange={this.onOperationVal.bind(this,side)} value={this.state.condition[side].operation ?  this.state.condition[side].operation.value : ''}/>
                </div>
                <div className="line_height_36 margin-left-15 delete_icon_edit">
                     
                {this.state.condition[side].operation && <Popconfirm title="Are you sure want to remove operation?" onConfirm={this.deleteOperation.bind(this,side)}  okText="Yes" cancelText="No">
                        <Icon  type="delete" /> 
                    </Popconfirm>}
                </div>
            </div>
            </div>
            </div>
        )
    }
    deleteOperation(side) {
        let prevState = this.state;
        delete prevState.condition[side].operation;
        this.props.onChange(prevState.condition,`invalid${side}Operation`) //  chenge /////
        this.setState(prevState)
    }
    deleteFunction(side) {
        let prevState = this.state;
        delete prevState.condition[side].function;
        this.props.onChange(prevState.condition, 'invalid'+side+'FunctionArgs')
        this.setState(prevState)
    }
    getFunctionColumn(side) {
        return ( 
            <div className="col-md-offset-2 col-md-7">

            <div className=""><label className="margin-bottom-0 edit_condition_label"><I18 tkey='Function' /></label></div>
            <div className="fuction_items">
            {this.state.condition['invalid'+side+'Function'] && <span className='invalid condition_edit_invalid fixed_label'><I18 tkey="Select function" /></span>}
            {this.state.condition['invalid'+side+'FunctionArgs'] && <span className='invalid condition_edit_invalid fixed_label'><I18 tkey="Invalid arguments" /></span>}
            
                <div className="width_select_condition">
                    
                    <Select                    
                        id="lhs"
                        value={this.state.condition[side].function ? this.state.condition[side].function.name : false}
                        className="w_100"
                        defaultActiveFirstOption={false}
                        onChange={this.onFunctionChange.bind(this, side)}
                        placeholder={i18Get('Select functions', utils.getLanguage())}
                        notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                        {(this.getType(this.state.condition[side].value) === 'NUMBER' || this.getType(this.state.condition[side].value) === 'DECIMAL') && this.getNumberFunctions()}
                        {this.getType(this.state.condition[side].value) === 'STRING' && this.getStringFunctions()}
                    </Select>       
                </div>
               {this.state.condition[side].function && this.state.condition[side].function.name &&  <div className="width_select_condition position_relative">
                    {/* <label className="control-label " for="l_val"><I18 tkey="Argument" /></label> */}
                    {/* {this.state.invalidFunctionalArgs && <span className='invalid user_invalid fixed_label'><I18 tkey="Enter value" /></span>} */}
                    {  this.getFunctionalArgsColumns(this.getNumberOfArgs(this.state.condition[side].function.name, this.getType(this.state.condition[side].value)),side)}
                </div>}
                <div className="line_height_36 margin-left-15 delete_icon_edit-fuution">
                 
                 {this.state.condition[side].function && <Popconfirm title="Are you sure want to remove function?" onConfirm={this.deleteFunction.bind(this,side)}  okText="Yes" cancelText="No">
                    <Icon  type="delete" /> 
                 </Popconfirm>}
                </div>
            </div>
            </div>
        )
    }
    getFunctionalArgsColumns(count,side) {
        if(!count) {
            return
        }
        let ar = [];
        for(let i=0; i < count; i++) {
            ar.push(
                <Input id="l_val" maxLength='45'   type="text" onChange={this.onFunctionArgsChange.bind(this, i, side)} value={this.state.condition[side].function['params'+(i+1)]}/>
            )
        }
        return ar;
    }
    onFunctionArgsChange(i,side, e) {
        let prevState = this.state;
        prevState.condition[side].function['params'+(i+1)] = e.target.value;
        // prevState.invalidFunctionalArgs = false;
        this.props.onChange(prevState.condition, `invalid${side}FunctionArgs`)
        this.setState(prevState)
    }
    getNumberOfArgs(name, type) {
        switch(type) {
            case 'STRING' : 
                for(let i =0; i < constants.stringFunctions.length; i++) {
                    if(constants.stringFunctions[i].name === name) {
                        return constants.stringFunctions[i].args
                    }
                }
                break;
            
            case 'NUMBER':
            case 'DECIMAL': 
                for(let i = 0; i < constants.numberFunctions.length; i++) {
                    if(constants.numberFunctions[i].name === name) {
                        return constants.numberFunctions[i].args
                    }
                }
                break; 
            default: return 0;
        }
    }
    rhsTypeChange(e) {
        let prevState = this.state;
        prevState.condition.rhs.type = e.target.value;
        prevState.condition.rhs.value = '';
        prevState.condition.rhs.selectedValue = '';
        delete prevState.condition.rhs.function;
        delete prevState.condition.rhs.operation;
        this.props.onChange(prevState.condition,'invalidRhs')
        this.setState(prevState)
    }
    getValidColumn(e, side) {
        if(e) {
            let value = e.substring(e.indexOf('-aliasID-')+9, e.length);
            let alias = e.substring(0, e.indexOf('-aliasID-'));
            if(side === 'lhs') {
                if(this.props.attributes.findIndex(p => ((p.name == value) && p.source_alias == alias) ) !== -1 ) {
                    return e
                }
            } else {
                if(this.props.attributesRhs.findIndex(p => ((p.name == value) && p.source_alias == alias) ) !== -1 ) {
                    return e
                }
            }
            let prevState = this.state;
            prevState.condition[side].value = undefined; 
            prevState.condition[side].selectedValue = undefined;
            prevState.condition[side].source_alias = undefined;
            delete prevState.condition[side].operation;
            delete prevState.condition[side].function;
            this.props.onChange(prevState.condition);
            this.setState(prevState);
        } 

        return undefined;
       
    }
    render() {
        this.state.condition = this.props.condition
      return (
        <div className="w_100 background_edit_condition row margin-bottom-20 "> 
            <div className="col-md-4">
                <div className={"width_select_condition position_relative  edit_condition_top_menu"}>
                    <div className="">
                        <div className="edit_condition_section position_relative"> <label className="edit_condition_label"><I18 tkey='Lhs' /></label>
                            <div>
                                {this.state.condition.invalidLhs && <span className='invalid value_invalid fixed_label'><I18 tkey="Select value" /></span>}
                                <Select                    
                                    id="lhs"
                                    value={this.getValidColumn(this.state.condition.lhs.selectedValue,'lhs')}
                                    className=""
                                    defaultActiveFirstOption={false}
                                    onChange={this.onAttributeChange.bind(this, 'lhs')}
                                    placeholder={i18Get('Select column', utils.getLanguage())}
                                    notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                                    {this.getAttributes('lhs')}
                                </Select>
                                <div className={`zigma_icon ${this.state.showLhsOperation ? 'zigma_icon_selected' : 'zigma_icon_default'}`} onClick={(e)=>this.setState({showLhsOperation: this.state.showLhsOperation ? false : true, showRhsOperation:false})}>
                                    <svg fill={(this.state.condition.lhs.function || this.state.condition.lhs.operation ) ? 'red' : ''} xmlns="http://www.w3.org/2000/svg"  version="1.1" id="Layer_1" x="0px" y="0px" viewBox="-707 575.3 157.7 191.7" >
                                        <path d="M-558.9,767h-134.2c-3.7,0-7.1-2.2-8.7-5.5c-1.6-3.4-1.1-7.3,1.3-10.2l66.8-80.1l-66.8-80.1c-2.4-2.9-2.9-6.8-1.3-10.2  c1.6-3.4,5-5.5,8.7-5.5h134.2c5.3,0,9.6,4.3,9.6,9.6v28.8c0,5.3-4.3,9.6-9.6,9.6c-5.3,0-9.6-4.3-9.6-9.6v-19.2h-104.1l58.8,70.5  c3,3.6,3,8.7,0,12.3l-58.8,70.5h104.1v-19.2c0-5.3,4.3-9.6,9.6-9.6c5.3,0,9.6,4.3,9.6,9.6v28.8C-549.3,762.7-553.6,767-558.9,767z"/>
                                    </svg> 
                                </div>
                            </div>
                        </div> 
                    </div>
                </div>
                
            </div> 
            <div className='col-md-4'>
                <div className={"width_select_condition  ant-d-color"}>
                    <div><label className=" edit_condition_label"><I18 tkey='Operand' /></label></div>
                    {this.state.condition.invalidOperand && <span className='invalid user_invalid fixed_label'><I18 tkey="Enter Column name" /></span>}
                    <Select                    
                        id="operand"
                        value={this.state.condition.operand}
                        className=""
                        defaultActiveFirstOption={false}
                        onChange={this.onOperandChange.bind(this)}
                        placeholder={i18Get('Select Mode', utils.getLanguage())}
                        notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                        {this.getOperands()}
                    </Select>
                </div>
            </div>
            
            {this.state.condition.rhs.type === VALUE && <div className='col-md-4'> 
                <div className={"width_select_condition padding-left-15 "}>
                <div> <label className="control-label edit_condition_label " for="l_name"><I18 tkey="Rhs" /></label> </div>
                    <div className="position_relative">
                        {this.state.condition.invalidRhs && <span className='invalid rhs_invalid fixed_label'><I18 tkey="Enter value" /></span>}
                        <Input id="l_name" maxLength='45' className='min-width-rhs-input'   type="text" onChange={this.valueChanges.bind(this)} value={this.state.condition.rhs.value}/>
                        {this.props.attributesRhs.length ? <div className="margin-left-20 edit_condition_value_btn">
                        <RadioGroup className='rhs_switch' onChange={this.rhsTypeChange.bind(this)} value={this.state.condition.rhs.type}>
                            <RadioButton  value={VALUE}>{utils.toPascalCase(VALUE)}</RadioButton>
                            <RadioButton value={COLUMN}>{utils.toPascalCase(COLUMN)}</RadioButton>
                        </RadioGroup>
                        </div> : ''}
                    </div>
                </div>
            </div>}

            {this.state.condition.rhs.type === COLUMN && <div className='col-md-4'> <div className={"width_select_condition padding-left-15"}>
                <div> <label className="control-label edit_condition_label " for="l_name"><I18 tkey="RHS" /></label> </div>
                <div className="position_relative">
                    {this.state.condition.invalidRhs && <span className='invalid rhs_invalid fixed_label'><I18 tkey="Select value" /></span>}
                    <Select                    
                        id="lhs"
                        value={this.getValidColumn(this.state.condition.rhs.selectedValue, 'rhs')}
                        className=""
                        defaultActiveFirstOption={false}
                        onChange={this.onAttributeChange.bind(this, 'rhs')}
                        placeholder={i18Get('Select Attribute', utils.getLanguage())}
                        notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                        {this.getAttributes()}
                    </Select>
                    <div className={`zigma_icon ${this.state.showRhsOperation ? 'zigma_icon_selected' : 'zigma_icon_default'}`} onClick={(e)=>this.setState({showLhsOperation:false, showRhsOperation:this.state.showRhsOperation ? false : true})}>
                        <svg fill={(this.state.condition.rhs.function || this.state.condition.rhs.operation ) ? 'red' : ''} xmlns="http://www.w3.org/2000/svg"  version="1.1" id="Layer_1" x="0px" y="0px" viewBox="-707 575.3 157.7 191.7" >
                            <path d="M-558.9,767h-134.2c-3.7,0-7.1-2.2-8.7-5.5c-1.6-3.4-1.1-7.3,1.3-10.2l66.8-80.1l-66.8-80.1c-2.4-2.9-2.9-6.8-1.3-10.2  c1.6-3.4,5-5.5,8.7-5.5h134.2c5.3,0,9.6,4.3,9.6,9.6v28.8c0,5.3-4.3,9.6-9.6,9.6c-5.3,0-9.6-4.3-9.6-9.6v-19.2h-104.1l58.8,70.5  c3,3.6,3,8.7,0,12.3l-58.8,70.5h104.1v-19.2c0-5.3,4.3-9.6,9.6-9.6c5.3,0,9.6,4.3,9.6,9.6v28.8C-549.3,762.7-553.6,767-558.9,767z"/>
                        </svg> 
                    </div>
                    {this.props.attributesRhs.length ? <div className="margin-left-20 edit_condition_column_btn">
                        <RadioGroup className='rhs_switch' onChange={this.rhsTypeChange.bind(this)} value={this.state.condition.rhs.type}>
                            <RadioButton  value={VALUE}>{utils.toPascalCase(VALUE)}</RadioButton>
                            <RadioButton value={COLUMN}>{utils.toPascalCase(COLUMN)}</RadioButton>
                        </RadioGroup>
                    </div> : ''}
                </div>
            </div> </div>}
            
                    {/* LHS */}
                    {this.state.showLhsOperation && <div> 
                        {(this.getType(this.state.condition.lhs.value) === 'NUMBER' || this.getType(this.state.condition.lhs.value) === 'DECIMAL') &&
                            this.getOperationColumn('lhs') 
                        }
                    
                        {
                            this.getFunctionColumn('lhs')
                        }
                    </div>}
                    {/* RHS */}
                    
                    {this.state.condition.rhs.type === COLUMN && this.state.showRhsOperation && <div> 
                        {(this.getType(this.state.condition.rhs.value) === 'NUMBER' || this.getType(this.state.condition.rhs.value) === 'DECIMAL') &&
                            this.getOperationColumn('rhs') 
                        }
                    
                        {
                            this.getFunctionColumn('rhs')
                        }
                    </div>}
                   
                

         </div>
        )
    }
  
}   


export default  Condition;