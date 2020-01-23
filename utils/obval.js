function select(props) {
    function from(_object) {
        const object = _object || {};
        const new_object = {};
        props.forEach((prop) => {
            new_object[prop] = object[prop];
        })
        return new_object;
    }
    return {
        from: from
    }
}

function exclude(props) {
    function from(_object) {
        const object = _object || {};
        const new_object = {};
        const exclude_dict = {};
        props.forEach((prop) => {
            // create a lookup for props to exclude
            exclude_dict[prop] = 1;
        })
        Object.keys(object).forEach((key) => {
            // If prop is not in exclude lookup, add to new object
            if (!exclude_dict[key]) {
                new_object[key] = object[key];
            }
        });
        return new_object;
    }
    return {
        from: from
    }
}

module.exports = {
    select: select,
    exclude: exclude
}