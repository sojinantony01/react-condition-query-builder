import React, { Component } from 'react'
import I18,{i18Get} from './i18';
import utils from './utils/utils';
import {Select,  Input, Radio, DatePicker} from 'antd'
import Operation from '../operation'
import moment from 'moment'
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option
const operands = ['EQUALS', 'NOT_EQUALS', 'LESS_THAN', 'GREATER_THAN', 'LESS_THAN_EQUAL_TO', 'GREATER_THAN_EQUAL_TO', 'STARTS_WITH', 'ENDS_WITH', 'CONTAINS', 'IN', 'NOT_IN', 'IS_NULL', 'IS_NOT_NULL']
const VALUE = 'VALUE';
const COLUMN = 'COLUMN';
const OPERATION = 'OPERATION'

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
        let prevState = this.state;

        if(label == 'lhs') {
            prevState.condition.rhs.value = undefined; 
            prevState.condition.rhs.selectedValue = undefined;
        }
        let value = e.substring(e.indexOf('-aliasID-')+9, e.length);
        let alias = e.substring(0, e.indexOf('-aliasID-'));
        prevState.condition[label].value = value; 
        prevState.condition[label].selectedValue = e;
        prevState.condition[label].type = COLUMN;
        let invalid = label ==='lhs' ? 'invalidLhs' : 'invalidRhs';      
        prevState.condition[label].source_alias = alias;
        delete prevState.condition[label].operation;
        this.props.onChange(prevState.condition, invalid);
        this.setState(prevState);
    }

    onOperandChange(e) {
        let prevState = this.state;
        prevState.condition.operand = e;
        this.props.onChange(prevState.condition, 'invalidOperand')
        this.setState(prevState)
    }
    
    getAttributes(listSide,type, lhs) {
        if(listSide === 'lhs') {
            return this.props.attributes.map(d => {
                return <Option key={`${d.source_alias}-aliasID-${d.name}`} >{d.name +`${d.source_name ? ` (${d.source_name})`:''}`}</Option>
            })
        } else {
            return this.props.attributesRhs.map(d => {
                if(!type || (d.type === type || (d.type === 'DECIMAL' && type === 'NUMBER')) && !(d.name === lhs.value && d.source_alias === lhs.source_alias)) {
                    return <Option key={`${d.source_alias}-aliasID-${d.name}`} >{d.name +`${d.source_name ? ` (${d.source_name})` : ''}`}</Option>
                }
            })
        }
    }
    valueChanges(e) {
        let prevState = this.state;
        prevState.condition.rhs.value = e.target.value;
        this.props.onChange(prevState.condition, 'invalidRhs')
        this.setState(prevState)
    }
    onDateChange(e) {
        let prevState = this.state;
        prevState.condition.rhs.value =e.format('YYYY-MM-DDTHH:mm:ss');
        this.props.onChange(prevState.condition, 'invalidRhs')
        this.setState(prevState)
    }
    getOperands() {
        return operands.map(d => {
            return <Option key={d}>{utils.toPascalCase(d.replace(/_/g,' '))}</Option>
        })
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
                if(this.props.attributesRhs.findIndex(p => ((p.name == value) && p.source_alias == alias) && (this.state.condition.lhs.type === 'OPERATION' || p.type === this.getLhsActualType(this.state.condition.lhs.value, this.state.condition.lhs.source_alias))) !== -1 ) {
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
    getValue(val) {

        let variables = this.props.attributes.concat(this.props.attributesRhs);
        let reg = '';
        let value = val.value;
        if(value) {
            variables.map(d => {
                reg = new RegExp(d.source_alias, 'g');
                value = value.replace(reg, d.source_name);
            })
        }
       

        return value
     }
    render() {
        this.state.condition = this.props.condition
      return (
        <div className="w_100 background_edit_condition row margin-bottom-20 "> 
            <div className="col-md-4">
                <div className={"width_select_condition position_relative  edit_condition_top_menu"}>
                    <div className="">
                        <div className="edit_condition_section position_relative"> <label className="edit_condition_label"><I18 tkey='LHS' /></label>
                            <div>
                                {this.state.condition.invalidLhs && <span className='value_invalid fixed_label'><I18 tkey="Select value" /></span>}
                                {this.state.condition.lhs.operation ? <Input type='string' readOnly value={this.getValue(this.state.condition.lhs)} /> : 
                                <Select                    
                                    id="lhs"
                                    value={this.getValidColumn(this.state.condition.lhs.selectedValue,'lhs')}
                                    className=""
                                    defaultActiveFirstOption={false}
                                    onChange={this.onAttributeChange.bind(this, 'lhs')}
                                    placeholder={i18Get('Select column', utils.getLanguage())}
                                    notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                                    {this.getAttributes('lhs')}
                                </Select>}
                                <div className={`zigma_icon zigma_icon_default`} onClick={(e)=> {let prevState = this.state; prevState.showLhsOperation = true; if(this.state.condition.lhs.type !== OPERATION) { prevState.condition.lhs.value = ''; prevState.condition.lhs.selectedValue = undefined}   this.setState(prevState)} }>
                                    <svg fill={this.state.condition.lhs.operation ? 'red' : ''} xmlns="http://www.w3.org/2000/svg"  version="1.1" id="Layer_1" x="0px" y="0px" viewBox="-707 575.3 157.7 191.7" >
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
                <div> <label className="control-label edit_condition_label " for="l_name"><I18 tkey="RHS" /></label> </div>
                    <div className="position_relative">
                        {this.state.condition.invalidRhs && <span className='invalid rhs_invalid fixed_label'><I18 tkey="Enter value" /></span>}
                        {this.getType(this.state.condition.lhs.value, this.state.condition.lhs.source_alias) === 'DATETIME' ? <DatePicker  className='rhs_datepicker' allowClear={false} showTime  value={this.state.condition.rhs.value ? moment(this.state.condition.rhs.value) : false} onChange={this.onDateChange.bind(this)} onOk={this.onDateChange.bind(this)} /> :
                         <Input id="l_name" maxLength='45'  className='min-width-rhs-input'   type={this.getType(this.state.condition.lhs.value, this.state.condition.lhs.source_alias)} onChange={this.valueChanges.bind(this)} value={this.state.condition.rhs.value}/>}
                        {this.props.attributesRhs.length ? <div className="margin-left-20 edit_condition_value_btn">
                        <RadioGroup className='rhs_switch' onChange={this.rhsTypeChange.bind(this)} value={this.state.condition.rhs.type}>
                            <RadioButton  value={VALUE}>{utils.toPascalCase(VALUE)}</RadioButton>
                            <RadioButton value={COLUMN}>{utils.toPascalCase(COLUMN)}</RadioButton>
                        </RadioGroup>
                        </div> : ''}
                    </div>
                </div>
            </div>}

            {(this.state.condition.rhs.type === COLUMN || this.state.condition.rhs.type === OPERATION) && <div className='col-md-4'> <div className={"width_select_condition padding-left-15"}>
                <div> <label className="control-label edit_condition_label " for="l_name"><I18 tkey="RHS" /></label> </div>
                    <div className="position_relative">
                        {this.state.condition.invalidRhs && <span className='invalid rhs_invalid fixed_label'><I18 tkey="Select value" /></span>}
                        {this.state.condition.rhs.operation ? <Input type='string' readOnly value={this.getValue(this.state.condition.rhs)} /> : 

                        <Select                    
                            id="lhs"
                            value={this.getValidColumn(this.state.condition.rhs.selectedValue, 'rhs')}
                            className=""
                            defaultActiveFirstOption={false}
                            onChange={this.onAttributeChange.bind(this, 'rhs')}
                            placeholder={i18Get('Select Attribute', utils.getLanguage())}
                            notFoundContent={i18Get('Not Found', utils.getLanguage())} >
                            {this.getAttributes('rhs',this.getType(this.state.condition.lhs.value, this.state.condition.lhs.source_alias),  this.state.condition.lhs)}
                        </Select>}
                        <div className={`zigma_icon ${this.state.showRhsOperation ? 'zigma_icon_selected' : 'zigma_icon_default'}`} onClick={() => {let prevState = this.state; prevState.showRhsOperation = true; if(this.state.condition.rhs.type !== OPERATION) { prevState.condition.rhs.value = '';  prevState.condition.rhs.selectedValue = undefined}   this.setState(prevState)}}>
                            <svg fill={(this.state.condition.rhs.operation) ? 'red' : ''} xmlns="http://www.w3.org/2000/svg"  version="1.1" id="Layer_1" x="0px" y="0px" viewBox="-707 575.3 157.7 191.7" >
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
                </div> 
            </div>}
            
                 
            {this.state.showLhsOperation && <Operation replace={true} type={'ALL'} onCancel={() => {this.setState({showLhsOperation:false})}} value={this.state.condition.lhs.value} attributes={this.props.attributes} onChange={this.actionOperationChange.bind(this,'lhs')}/>      }
            {this.state.showRhsOperation && <Operation replace={true} type={'ALL'} onCancel={() => {this.setState({showRhsOperation:false})}} value={this.state.condition.rhs.value} attributes={this.props.attributesRhs} onChange={this.actionOperationChange.bind(this,'rhs')}/>      }

         </div>
        )
    }
    getType(column, alias) {
        let type = false;
        this.props.attributes.map(d =>{
            if(d.name === column && (d.source_alias === alias)) {
                type = d.type;
            }
        })
        if(type === 'DECIMAL') {
            return 'NUMBER'
        }
        return type;
    }
    getLhsActualType(column, alias) {
        let type = false;
        this.props.attributes.map(d =>{
            if(d.name === column && (d.source_alias === alias)) {
                type = d.type;
            }
        })
        return type;
    }
    actionOperationChange(side, val) {
        let prevState = this.state;
        prevState.condition[side].value = val;
        prevState.condition[side].operation = val;
        prevState.condition[side].selectedValue = undefined;
        prevState.condition[side].type = OPERATION;
        prevState.showLhsOperation = false;
        prevState.showRhsOperation = false;
        let invalid = side ==='lhs' ? 'invalidLhs' : 'invalidRhs';      
        this.props.onChange(prevState.condition, invalid);
        this.setState(prevState);
    }
  
}   



export default Condition;
