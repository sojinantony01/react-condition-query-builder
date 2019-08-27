import { message } from 'antd';

var language = 'en';


var getLanguage = () => {
    return language;
};

var setLanguage = (lang) => {
    language = lang;
};




var toPascalCase = (text) => {
    if(!text) {
        return text;
    }
    return text.replace(/(\w)(\w*)/g,
        function(g0,g1,g2) {
            return g1.toUpperCase() + g2.toLowerCase();
        });
 };



export default {
     
    getLanguage, 
    setLanguage, 
    
    toPascalCase, 
    
};