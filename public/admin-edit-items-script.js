const getItems = async() => {
    try {
        return (await fetch('./api/items/')).json();
    } catch (error) {
        console.log('error retrieving data');
    }
}

const showItems = async() => {
    const itemsJSON = await getItems();
    const section = document.getElementById('current-items');
    section.innerHTML = '';

    itemsJSON.forEach((item) => {
        // container for item
        const itemContainer = document.createElement('section');
        itemContainer.classList.add('flexbox');

        const infoSection = document.createElement('section');
        infoSection.classList.add('flex-item');
        
        const img = document.createElement('img');
        img.src = 'item-images/' + item.image_name;
        img.classList.add('image-small');
        infoSection.append(img);

        itemContainer.append(infoSection);

        const idSection = document.createElement('section');
        idSection.classList.add('flex-item');

        const p = document.createElement('p');
        p.innerHTML = item.name;
        idSection.append(p);

        itemContainer.append(idSection);

        const buttonSection = document.createElement('section');
        buttonSection.classList.add('flex-item');

        const editButton = document.createElement('button');
        editButton.innerHTML = 'Edit';
        editButton.classList.add('button');
        editButton.onclick = (e) => {
            e.preventDefault();
            populateForm(item);
        }
        buttonSection.append(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Delete';
        deleteButton.classList.add('space');
        deleteButton.classList.add('button');
        deleteButton.onclick = deleteItem.bind(this, item);
        buttonSection.append(deleteButton);

        itemContainer.append(buttonSection);

        section.append(itemContainer);
    });
};

const populateForm = (item) => {
    resetAddForm();

    document.getElementById('form-header').innerHTML = `Editing item: ${item.name}`;
    document.getElementById('btn-add').innerHTML = 'Confirm Edit';
    const form = document.getElementById('form-add-item');
    document.getElementById('form-header').scrollIntoView({
        behavior: 'smooth'
    });
    form._id.value = item._id;
    form.type.value = item.type;
    form.alt_text.value = item.alt_text;
    document.getElementById('img-prev').src = 'item-images/' + item.image_name;
    form.name.value = item.name;
    form.price.value = item.price;
    populateCheckBoxes(item.sizes);
    populateWidthsLengths(item.widths, item.lengths);
    form.description.value = item.description;

    const span = document.getElementById('reset');
    const button = document.createElement('button');
    button.innerHTML = 'Reset Form';
    button.classList.add('button');
    button.classList.add('space');
    button.onclick = () => {
        resetAddForm();
    }
    span.append(button);
};

const populateCheckBoxes = (sizes) => {
    const sizesStr = sizes + '';
    const sizesArr = sizesStr.split(',');
    const map = new Map([
        ['Small', 'cb-small'],
        ['Medium', 'cb-medium'],
        ['Large', 'cb-large'],
        ['Extra Large', 'cb-extra-large'],
        ['2XL', 'cb-2xl']
    ]);

    sizesArr.forEach((size) => {
        document.getElementById(map.get(size)).checked = true;
    })

    showWidthLengthInputs();
};

const populateWidthsLengths = (widths, lengths) => {
    const widthInputs = document.querySelectorAll('.width-input');
    const lengthInputs = document.querySelectorAll('.length-input');

    for(let i in widthInputs) {
        widthInputs[i].value = widths[i];
        lengthInputs[i].value = lengths[i];
    }
};

const resetAddForm = () => {
    const form = document.getElementById('form-add-item');
    document.getElementById('form-header').innerHTML = 'Add Item';
    document.getElementById('btn-add').innerHTML = 'Confirm Add';

    form.reset();
    document.getElementById('img-prev').src = 'https://place-hold.it/200x200';
    const checkboxes = document.getElementsByName('sizes');
    checkboxes.forEach((checkbox) => {
        if(checkbox.checked) !checkbox.checked;
    });
    document.getElementById('reset').innerHTML = '';
    document.getElementById('width-length-inputs').innerHTML = 'Please select at least 1 size';
};

const submitAddItem = async (e) => {
    e.preventDefault();
    const section = document.getElementById('item-to-be-added');
    if(getCheckedBoxes('sizes').length == 0) {
        section.innerHTML = 'Please select at least 1 size before adding an item!';
        return;
    }
    section.innerHTML = '';

    const form = e.target;
    const itemSizes = getCheckedBoxes('sizes');

    const widthsInputs = document.querySelectorAll('.width-input');
    const lengthsInputs = document.querySelectorAll('.length-input');

    let itemWidths = [];
    widthsInputs.forEach((width) => itemWidths.push(width.value));
    let itemLengths = [];
    lengthsInputs.forEach((length) => itemLengths.push(length.value));
    
    const formData = new FormData(form);
    formData.delete('sizes');
    formData.append('sizes', itemSizes);
    formData.append('widths', itemWidths);
    formData.append('lengths', itemLengths);
    
    for(let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    let response;
    // adding item
    if(form._id.value.trim() == '') {
        response = await fetch('./api/items', {
            method: 'POST',
            body: formData
        });
    } else {
        response = await fetch(`./api/items/${form._id.value}`, {
            method: 'PUT',
            body: formData
        });
    }

    const result = document.getElementById('add-result');
    if(response.status != 200) {
        result.innerHTML = 'Item add/edit unsuccessful. Please try again.'
        result.style.color = '#FF0000';
        setTimeout(() => result.innerHTML = '', 5000);
        return;
    } else {
        result.innerHTML = 'Item add/edit successful!'
        result.style.color = '#00FF00';
        setTimeout(() => result.innerHTML = '', 5000);
    }

    await response.json();
    resetAddForm();
    showItems();


};

const deleteItem = async(item) => {
    let response = await fetch(`./api/items/${item._id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    if(response.status != 200) {
        console.log('error deleting');
        return;
    }

    await response.json();
    showItems();
};

const showWidthLengthInputs = () => {
    const section = document.getElementById('width-length-inputs');
    const sizes = getCheckedBoxes('sizes');
    section.innerHTML = '';
    
    if(sizes.length == 0) {
        section.innerHTML = 'Please select at least 1 size';
        return;
    }

    section.innerHTML += 'Enter width(s)/length(s)';

    sizes.forEach((size) => {
        const p = document.createElement('p');
        const widthLabel = document.createElement('label');
        widthLabel.setAttribute('for', `width-entry-${size}`);
        widthLabel.classList.add('block');
        widthLabel.innerHTML = `${size} width`;
        const widthInput = document.createElement('input');
        widthInput.setAttribute('type', 'number');
        widthInput.setAttribute('maxlength', '3');
        widthInput.setAttribute('id', `width-entry-${size}`);
        widthInput.setAttribute('required', '');
        widthInput.setAttribute('placeholder', `${size} width`);
        widthInput.classList.add('width-input');

        const lengthLabel = document.createElement('label');
        lengthLabel.setAttribute('for', `length-entry-${size}`);
        lengthLabel.classList.add('block');
        lengthLabel.innerHTML = `${size} length`;
        const lengthInput = document.createElement('input');
        lengthInput.setAttribute('type', 'number');
        lengthInput.setAttribute('maxlength', '3');
        lengthInput.setAttribute('id', `length-entry-${size}`);
        lengthInput.setAttribute('required', '');
        lengthInput.setAttribute('placeholder', `${size} length`);
        lengthInput.classList.add('length-input');

        p.appendChild(widthLabel);
        p.appendChild(widthInput);
        p.appendChild(lengthLabel);
        p.appendChild(lengthInput);
        section.append(p);
    });  
};

const getCheckedBoxes = (checkboxes) => {
    const boxes = document.getElementsByName(checkboxes);
    const boxSizePairs = new Map([
        ['cb-small', 'Small'],
        ['cb-medium', 'Medium'], 
        ['cb-large', 'Large'],
        ['cb-extra-large', 'Extra Large'],
        ['cb-2xl', '2XL']
    ]);
    let sizes = [];

    for(let i in boxes) {
        if(boxes[i].checked) {
            sizes.push(boxSizePairs.get(boxes[i].id));
        }
    }
    return sizes;
};

const toggleHamburger = () => {
    document.getElementById("main-nav-list").classList.toggle("hide-small");
};

window.onload = () => {
    document.getElementById("hamburger").onclick = toggleHamburger;
};


showItems();

document.getElementById('item-sizes').onclick = showWidthLengthInputs;
document.getElementById('form-add-item').onsubmit = submitAddItem;
document.getElementById('image_name').onchange = (e) => {
    const preview = document.getElementById('img-prev');

    if(!e.target.files.length) {
        preview.src = 'https://place-hold.it/200x200';
        return;
    }

    preview.src = URL.createObjectURL(e.target.files.item(0));
}