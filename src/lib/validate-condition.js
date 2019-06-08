import constants from '../../../../../../../constants/condition-functions.json'

let checkParams = (d, side) => {
    let valid = true;
    let count = constants.all[d[side].function.name];
    for(var i=0;i< count; i++) {
        if(!d[side].function['params'+(i+1)]){
            valid = false
        }
    }
    return valid
}
let validateConditions = (condition) => {
    let valid = true
    condition.map((d , i)=> {
        if(d.values && d.values.length) {
            let {values, check} = validateConditions(d.values);
            d.values = values;
            
            if(!check) {
                valid = false; 
            }
        } else {
            console.log('condition',d)
            if(!d.lhs.value) {
                d.invalidLhs = true;
                d.invalidCondition = true
                valid = false
            }
            if(d.lhs.value && d.lhs.operation) {
                if(!d.lhs.operation.operand || ! d.lhs.operation.value) {
                    d.invalidlhsOperation = true;
                    d.invalidCondition = true
                    valid = false
                } 
            }
            if(d.lhs.value && d.lhs.function) {
                if(!d.lhs.function.name ) {
                    d.invalidlhsFunction = true;
                    d.invalidCondition = true
                    valid = false
                } else if(!checkParams(d,'lhs')) {
                    d.invalidlhsFunctionArgs = true;
                    d.invalidCondition = true
                    valid = false
                }
            }
            
            if(!d.operand){
                d.invalidOperand = true;
                d.invalidCondition = true
                valid = false
            }
            if(!d.rhs.value) {
                d.invalidRhs = true;
                d.invalidCondition = true
                valid = false
            }
            if(d.rhs.value && d.rhs.operation) {
                if(!d.rhs.operation.operand || ! d.rhs.operation.value) {
                    d.invalidrhsOperation = true;
                    d.invalidCondition = true
                    valid = false
                } 
            }
            if(d.rhs.value && d.rhs.function) {
                if(!d.rhs.function.name ) {
                    d.invalidrhsFunction = true;
                    d.invalidCondition = true
                    valid = false
                } else if(!checkParams(d,'rhs')) {
                    d.invalidrhsFunctionArgs = true;
                    d.invalidCondition = true
                    valid = false
                }
            }

           
        }
    })
    return {values:condition, check:valid}
}
export default validateConditions;