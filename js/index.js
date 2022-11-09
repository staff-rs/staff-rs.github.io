import("../pkg/index.js").catch(console.error);


const Piano = () => {
    let keys = [];
    for (var i = 0; i < 12; i++) {
        console.log(i);
        keys.push(<li>{i}</li>);
    }
    console.log(keys);
    return (<ul>{keys}</ul>);
};



const e = React.createElement;
const domContainer = document.querySelector('#piano');
const root = ReactDOM.createRoot(domContainer);
root.render(e(Piano));