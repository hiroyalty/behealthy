'use strict';

let originalData = null;

const createCard = (image, title, text) => {
    return `<img class="card-img-top" src="files/uploads/${image}" alt="">
            <div class="card-block">
                <h3 class="card-title">${title}</h3>
                <p class="card-text">${text}</p>
            </div>
            `;
};
const viewFooting = (id) => {
	return `<div class="card-footer">
                <button class="btn btn-primary btn-sm" id="seemore">View</button>
            </div>`;
};

const updateFooting = () => {
	return `<div class="card-footer">
				<button type="button" class="btn btn-secondary btn-sm" id="updatecard" name="updatecard">Update</button>
            </div>`;
};

const deleteFooting = (id) => {
	return `<div class="card-footer">
				<button type="button" class="btn btn-success btn-sm" id="deletecard" name="deletecard">Delete</button>
			</div>`;
};

const getData = () => { 
    fetch('listcats')
        .then((response) => {
			console.log('file loaded');
            return response.json();
        })
        .then((items) => {
            originalData = items;
            update(items);
        });
};

const update = (items) => {
    categoryButtons(items);
    document.querySelector('.card-deck').innerHTML = '';
    for (let item of items) {
        console.log(item);
        const article = document.createElement('article');
		const viewleg = document.createElement('viewleg');
		const updateleg = document.createElement('updateleg');
		const deleteleg = document.createElement('deleteleg');
		
        article.setAttribute('class', 'card');
		
        article.innerHTML = createCard(item.thumbnail, item.title, item.details);
        article.addEventListener('click', () => {
            document.querySelector('.modal-body img').src = item.image;
            document.querySelector('.modal-title').innerHTML = item.title;
            $('#myModal').modal('show');
        });
		viewleg.innerHTML = viewFooting(item._id);
		updateleg.innerHTML = updateFooting();
		deleteleg.innerHTML = deleteFooting(item._id);
		
		viewleg.addEventListener('click', () => {
			console.log('clicked');
			alert('clicked view'+ JSON.stringify(item));
        }); 
		updateleg.addEventListener('click', () => {
			//console.log('clicked');
			//alert('clicked update'+ item._id);
			editablecat = item;
			//alert('editablecat'+ JSON.stringify(editablecat));
			//loadonecat(item._id);
			window.location.href = "/viewone.html?item_id=" + item._id + "&title=" + item.title + "&details=" + item.details + "&category=" + item.category + "&img=" + item.thumbnail;
		});
		deleteleg.addEventListener('click', () => {
			
			deleteData(item._id, item.thumbnail);
        });
		
		article.appendChild(viewleg);
		article.appendChild(updateleg);
		article.appendChild(deleteleg);
        document.querySelector('.card-deck').appendChild(article);
    }
};

getData();