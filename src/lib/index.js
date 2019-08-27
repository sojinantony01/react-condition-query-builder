import React, { Component } from 'react'
import I18, {i18Get} from './i18';
import { Button, Icon, Popconfirm} from 'antd';
import ConditionEdit from './edit-conditions'
import validateConditions from './validate-condition'
import './index.css'


class Conditions extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data:{},
        };
    }

    componentWillMount () {
        this.props.onRef(this);
        this.state.conditions = this.props.conditions ? JSON.parse(JSON.stringify(this.props.conditions)) : {type:'IF',values:[]}
    }
    getDefaultCondition() {
        return  {
            lhs:{
                type:'COLUMN',
                value: this.props.attribute,
                selectedValue: this.props.attribute,
            },
            operand:'EQUALS',
            
            rhs: {
                type:'VALUE',
                value:''
            },
            key: new Date().getTime()
        }
    }
    addDefaultCondition() {
        let prevState = this.state;
        prevState.conditions.values.push(this.getDefaultCondition());
        this.props.onChange(prevState.conditions);
        // this.setState(prevState);
    }


    validate() {
        let prevState = this.state;
        let {values, check} = validateConditions(this.state.conditions.values);
        prevState.conditions.values = values;   
        if(!check) {
            this.props.onChange(prevState.conditions);
            // this.setState(prevState)
        }
        
        return check;
    }


    findData(data, conditions, invalid) {
        for(let i = 0; i<=conditions.length ; i++) {
            if(conditions[i] && conditions[i].key &&  conditions[i].key === data.key) {
                conditions[i] = data;
                conditions[i].invalidCondition = false;
                conditions[i][invalid] = false;
                break;
            }
            else if(conditions[i] && conditions[i].values) {
            conditions[i].values =  this.findData(data,conditions[i].values, invalid);
            }
        }
        return conditions;
    }

    onConditionChange(data, invalid) {
        let prevState = this.state;
        prevState.conditions.values =  this.findData(data, prevState.conditions.values, invalid)  
        this.props.onChange(prevState.conditions);
        // this.setState(prevState);  
    }

    renderConditions(data, op) {
        return data.map((d , i)=> {
            if(d.values && d.values && d.values.length) {
                return ( 
                    <div>
                       {i ? <div className="text_align_center"><label>{ op }</label></div> : ''}
                        <div className={"condition-group-box"}>       
                            {this.renderConditions(d.values, d.op)}                      
                            <span className="condition_group_box_more">
                            <Icon onClick={this.changeShowOptions.bind(this, d.key)} type="more" />
                        </span>
                        {this.state.showOptions === d.key && this.getActionButtons(d,'group')}         
                        </div> 
                    </div>
                )
            }

            return (<div>
                {i ? <div className="text_align_center"><label>{ op }</label></div> : ''}
                <div className={` `}>
                    <div className={`container-fluid position_relative`}> 
                        {d.invalidCondition &&  <span className="invalid_condition"><I18 tkey='Invalid condition' /></span>}
                        <ConditionEdit source_alias_1={this.state.source_alias_1} source_alias_2={this.state.source_alias_2} condition={d} key={d.key}   attributes={this.props.attributes} attributesRhs={this.props.attributesRhs} onChange={this.onConditionChange.bind(this)}/>  
                        <span className="condition_more_icon">
                            <Icon onClick={this.changeShowOptions.bind(this,d.key)} type="more" />
                        </span>
                        {this.state.showOptions === d.key && this.getActionButtons(d, 'CONDITION')}     
                    </div>
                </div>  
            </div>)
        })
        
    }
    changeShowOptions(id) {
        if(this.state.showOptions === id) {
            this.setState({showOptions:undefined})
        } else {
            this.setState({showOptions:id})

        }
    }

    findAndDeleteCondition(data, conditions, isParent) {
        for(let i = 0; i<= conditions.values.length ; i++) {
            if(conditions.values[i] && conditions.values[i].key === data.key) {
                if(conditions.values.length > 2 || isParent) {
                    conditions.values.splice(i, 1)
                } 
                // else if(conditions.values[i].values && conditions.values[i].values.length) {
                //     conditions.values.splice(i, 1)
                // }

                else {
                    conditions = conditions.values[i === 0 ? 1 : 0]
                }
                return conditions          
               
            }
            else if(conditions.values[i] && conditions.values[i].values && conditions.values[i].values.length) {
                conditions.values[i] = this.findAndDeleteCondition(data, conditions.values[i], false) 
            }
        }
        return conditions
           
    }
    deleteCondition(data) {
        let prevState = this.state;
        prevState.conditions = this.findAndDeleteCondition(data, prevState.conditions, true);
        prevState.invalidDepth = false;
        prevState.showOptions = undefined;
        this.props.onChange(prevState.conditions);
        // this.setState(prevState);

    }
    findAndANDData(data, conditions, newData) {
        for(let i = 0; i<=conditions.length ; i++) {
            if(conditions[i] && conditions[i].key === data.key) {
                conditions[i] = newData;
                break;
            }
            else if(conditions[i] && conditions[i].values) {
            conditions[i].values = this.findAndANDData(data,conditions[i].values, newData)
            }
        }
        return conditions;
    }
    findDepth(conditions, depth) {
        let newDepth = depth
        for(let i = 0; i <= conditions.length; i++) {
            if(conditions[i] && conditions[i].values) {  
                newDepth = this.findDepth(conditions[i].values, depth + 1)
                
            }     
        }
        return newDepth;
    }
    addClicked(data, op) {  
        let prevState = this.state;
        prevState.invalidDepth = false;
        let tempData = {}
        if(!data.values || !data.values.length || data.op !== op) {
            if(this.findDepth(prevState.conditions.values, 1) >= 6 ) {
                console.log('Max depth reached');
                return
            }
            tempData.values = []
            tempData.type = 'OP';
            tempData.op = op;
            tempData.key =  `${new Date().getTime()}-op`
            tempData.values.push(data);
            tempData.values.push(this.getDefaultCondition())
        } else {
            tempData = data;
            tempData.values.push(this.getDefaultCondition())
        }
      
        prevState.conditions.values =  this.findAndANDData(data, prevState.conditions.values, tempData, 0) ;
        prevState.showOptions = undefined;
        this.props.onChange(prevState.conditions);
        // this.setState(prevState) 
    }
    getActionButtons(data, type) {
        return (
            <div className={type === 'CONDITION' ? "card_condition_more_condition" : "card_condition_more_group"} >
            
                <div className="pop-up-close"  onClick={this.changeShowOptions.bind(this, data.key)}><Icon type="close"/></div>
                <div><Button  className="card-condition-and card-condition-btn"  onClick={this.addClicked.bind(this, data, 'AND')}><I18 tkey="AND" /></Button></div>
                <div><Button className="card-condition-or card-condition-btn" onClick={this.addClicked.bind(this, data, 'OR')}><I18 tkey="OR" /></Button></div>
                <Popconfirm title="Are you sure want to remove condition?" onConfirm={this.deleteCondition.bind(this, data)}  okText="Yes" cancelText="No">
                    <div><Button className="card-condition-delete card-condition-btn"  ><I18 tkey="Delete" /></Button></div>
                </Popconfirm>

            </div>
        )
    }
    clearClicked() {
        this.props.onChange(undefined);
    }


    render() { 
      return (
            <div className="h_100">
                <div className="row h_100">
                    <div className="col-md-12 col-sm-12  ">
                        <div className="text_align_right"> {this.state.conditions && this.state.conditions.values && this.state.conditions.values.length ? <Popconfirm title="Are you sure want to clear conditions?" onConfirm={this.clearClicked.bind(this)}  okText="Yes" cancelText="No">
                            <a className="clear_button"><I18  tkey="Clear" /></a>
                            </Popconfirm> : ''} 
                        </div>
                        
                        {!this.state.conditions || !this.state.conditions.values || !this.state.conditions.values.length &&<div className="background_edit_condition_add text_align_center"> <Button onClick={this.addDefaultCondition.bind(this)}><I18 tkey='Add condition' /></Button></div>}
                        <div className="create_condition_col">
                        {this.renderConditions(this.state.conditions.values,'')}
                        </div>
                    </div>
                

                 </div>
             </div>
             
        )
    }
}   


export default Conditions;
