class GetArticles {
    constructor() {
        this.searchUrl = 'https://newsapi.org/v2/';
        this.apiKey = 'a7ce20d66ed9428483334b6a27210bbc';
    }

    static sortArticlesByDate(articles) {
        return articles.filter(article => article.publishedAt !== null)
            .map((article) => {
                let { publishedAt } = article;
                publishedAt = new Date(publishedAt);
                return Object.assign(article, { publishedAt });
            })
            .sort((articleB, articleA) => (
                Number(articleA.publishedAt) - Number(articleB.publishedAt)
            ));
    }


    getFullUrl(searchKey, searchValue) {
        const { searchUrl, apiKey } = this;

        switch (searchKey) {
            case 'catigories': {
                return `${searchUrl}top-headlines?category=${searchValue}&apiKey=${apiKey}`;
            }
            case 'sources': {
                return `${searchUrl}top-headlines?sources=${searchValue}&apiKey=${apiKey}`;
            }
            case 'query': {
                return `${searchUrl}everything?q=${searchValue}&apiKey=${apiKey}`;
            }
            default: {
                return new Error('invalid searhKey or searchValue');
            }
        }
    }

    searchArticles(searchKey, searchValue) {
        return fetch(this.getFullUrl(searchKey, searchValue))
            .then(response => response.json())
            .then(({ articles }) => GetArticles.sortArticlesByDate(articles))
            .catch(error => console.log(error.message));
    }
}

class App {
    constructor(defaultSources) {
        this.body = document.body;
        this.articlesContainer = document.querySelector('.articles-container');
        this.form = document.forms['search-form'];
        this.radioButtonsValue = this.form.radio.value;
        this.articles = null;
        this.getArticles = new GetArticles();
        this.defaultSources = defaultSources;
    }

    static getTemplate({
        url,
        urlToImage,
        description,
        source: { name },
        title,
        author,
        publishedAt,
    }) {
        const options = {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        };

        return `
            <div class="article__img-container">
                <a class="article__img-wrapper" href="${url}">
                    <img class="article__img" src="${urlToImage}" />
                    <p class="article__description">${description}</p>
                </a>
                <span class="article__source">${name}</span>
            </div>
            <div class="article__content-container">
                <h3 class="article__title">
                    <a href="${url}">${title}</a>
                </h3>
                <p class="article__published">${author} - ${publishedAt.toLocaleString('en-US', options)}</p>
            </div>
        `;
    }

    createArticles() {
        const container = document.createDocumentFragment();

        this.articles.forEach((article) => {
            const newArticle = document.createElement('article');

            newArticle.classList.add('article');
            newArticle.innerHTML = App.getTemplate(article);
            container.appendChild(newArticle);
        });

        this.body.classList.toggle('with-spinner');
        this.articlesContainer.appendChild(container);
    }

    articlesNotFound() {
        this.body.classList.toggle('with-spinner');
        this.articlesContainer.innerHTML = `
            <p class="searchError">Nothing found... try again</p>
        `;
    }

    submitFormHandler(e) {
        const searchValue = this.form[this.radioButtonsValue].value;

        if (searchValue !== '') {
            this.articlesContainer.innerHTML = '';
            this.body.classList.toggle('with-spinner');
            this.searchAndRenderArticles(this.radioButtonsValue, searchValue);
        }

        e.preventDefault();
    }

    onChangeRadioHandler(e) {
        const { target } = e;
        const { radioButtonsValue, form } = this;

        if (target.type === 'radio' && target.value !== radioButtonsValue) {
            form[radioButtonsValue].classList.toggle('active');
            this.radioButtonsValue = target.value;
            form[target.value].classList.toggle('active');
        }
    }

    searchAndRenderArticles(searchKey, searchValue) {
        return this.getArticles.searchArticles(searchKey, searchValue)
            .then((articles) => {
                this.articles = articles;

                if (this.articles.length > 0) {
                    this.createArticles();
                } else {
                    this.articlesNotFound();
                }
            });
    }

    init() {
        const radiosContainer = document.querySelector('.radios-container');

        this.form.addEventListener('submit', this.submitFormHandler.bind(this));
        radiosContainer.addEventListener('click', this.onChangeRadioHandler.bind(this));
        this.searchAndRenderArticles('sources', this.defaultSources.toString());
    }
}

const newsApp = new App([
    'bbc-news',
    'independent',
    'the-washington-post',
    'the-new-york-times',
    'al-jazeera-english',
]);

newsApp.init();
