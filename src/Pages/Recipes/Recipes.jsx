import React, { useEffect, useState, useCallback } from 'react'
import { API_BASE_URL } from '../../API'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import './Recipes.css'

import ProfileBtn from '../../Components/ProfileBtn/ProfileBtn';
import Loader from '../../Components/Loader/Loader';
import FoodContainer from '../../Components/Container/FoodContainer';

import recipesSvg from '../../Assets/svg/recipes.svg'
import dessert from '../../Assets/svg/croissant.svg'
import breakfast from '../../Assets/svg/avocado.svg'
import dinner from '../../Assets/svg/meat.svg'

const categoryIcons = {
    'Десерты': dessert,
    'Завтраки': breakfast,
    'Обеды и ужины': dinner
};

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0
    })
};

const transition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
};

export default function Recipes({ data }) {
    const [categories, setCategories] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [[page, direction], setPage] = useState([0, 0]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setPage([1, 1]);
    };

    const handleRecipeSelect = async (recipe) => {
        setSelectedRecipe(recipe);
        setPage([2, 1]);
        setIsLoadingRecipe(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/cms/api/recipes/client/${recipe.id}`);
            setSelectedRecipe(response.data.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        } finally {
            setIsLoadingRecipe(false);
        }
    };

    const handleBack = useCallback(() => {
        if (page === 2) {
            setSelectedRecipe(null);
            setPage([1, -1]);
        } else if (page === 1) {
            setSelectedCategory(null);
            setPage([0, -1]);
        } else if (page === 0) {
            window.showContent = false;
            window.dispatchEvent(new Event('showContentChange'));
        }
    }, [page]);

    useEffect(() => {
        // Устанавливаем handleBack только если мы не на странице рецептов
        if (page !== 2) {
            window.handleBack = handleBack;
            document.body.setAttribute('data-handle-back', 'true');
        } else {
            window.handleBack = null;
            document.body.removeAttribute('data-handle-back');
        }

        return () => {
            window.handleBack = null;
            document.body.removeAttribute('data-handle-back');
        };
    }, [page]); // Убираем handleBack из зависимостей

    useEffect(() => {
        const fetchRecipes = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/cms/api/recipes/client/categories`);
                setCategories(response.data.data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    const fetchCategoryRecipes = async (categoryName, page = 1) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/cms/api/recipes/client/category/${categoryName}?page=${page}`);
            const { data, meta } = response.data;
            console.log(response.data);
            if (page === 1) {
                setRecipes(data);
            } else {
                setRecipes(prev => [...prev, ...data]);
            }

            setHasMore(page < meta.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching category recipes:', error);
        }
    };

    useEffect(() => {
        if (selectedCategory) {
            setCurrentPage(1);
            setRecipes([]);
            fetchCategoryRecipes(selectedCategory.name);
        }
    }, [selectedCategory]);

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            fetchCategoryRecipes(selectedCategory.name, currentPage + 1)
                .finally(() => setIsLoadingMore(false));
        }
    };

    return (
        <div className='recipesPage'>
            <div className='topRecipes'>
                <ProfileBtn level={data.user_level} user_photo={data.image} />
                <div className='topRecipesTitle'>
                    <img src={recipesSvg} alt='logo' />
                    <h1>Рецепты{selectedCategory?.name ? `: ${selectedCategory.name}` : ''}</h1>
                </div>
            </div>
            <div className='botRecipes'>
                {isLoading ? (
                    <Loader />
                ) : (
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {page === 0 ? (
                            <motion.div
                                key="categories"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className='botRecipesContent'
                            >
                                {categories?.sort((a, b) => {
                                    const order = ['Завтраки', 'Обеды и ужины', 'Десерты'];
                                    return order.indexOf(a.name) - order.indexOf(b.name);
                                }).map((category, index) => (
                                    <FoodContainer
                                        key={index}
                                        title={category.name}
                                        onClick={() => handleCategorySelect(category)}
                                        icon={categoryIcons[category.name]}
                                        iconAlt={category.name}
                                    />
                                ))}
                            </motion.div>
                        ) : page === 1 ? (
                            <motion.div
                                key="category-content"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className='categoryContent'
                            >
                                <button onClick={() => {
                                    setSelectedCategory(null);
                                    setPage([0, -1]);
                                }} className='backBtn'
                                    style={{ position: 'unset', width: 'fit-content' }}
                                >
                                    Назад
                                </button>
                                <h2 className='categoryTitle'>{selectedCategory.name}</h2>
                                <div className='categoryRecipes'>
                                    {recipes.map((recipe) => (
                                        <div
                                            key={recipe.id}
                                            className='recipeItem'
                                            onClick={() => handleRecipeSelect(recipe)}
                                        >
                                            {recipe.title}
                                        </div>
                                    ))}
                                    {isLoadingMore && <Loader />}
                                    {hasMore && !isLoadingMore && (
                                        <button onClick={handleLoadMore} className='loadMoreBtn'>
                                            Загрузить еще
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="recipe-content"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className='recipeContent'
                            >
                                <button onClick={() => {
                                    setSelectedRecipe(null);
                                    setPage([1, -1]);
                                }} className='backBtn'
                                    style={{ position: 'unset', width: 'fit-content' }}
                                >
                                    Назад
                                </button>
                                {isLoadingRecipe ? (
                                    <Loader />
                                ) : (
                                    <div className='recipeContent'>
                                        <h2 className='recipeTitle'>{selectedRecipe.title}</h2>
                                        {selectedRecipe.image && (
                                            <img
                                                src={selectedRecipe.image.url}
                                                alt={selectedRecipe.title}
                                                className='recipeImage'
                                            />
                                        )}
                                        <div className='recipeDescription'>
                                            {selectedRecipe.nutrition &&
                                                <div className='nutrition'>
                                                    <h3>Пищевая ценность</h3>
                                                    {selectedRecipe.nutrition.calories && (
                                                        <div className='nutritionItem'>
                                                            <p>Калории</p>
                                                            <span>{selectedRecipe.nutrition.calories}</span>
                                                        </div>
                                                    )}
                                                    {selectedRecipe.nutrition.proteins && (
                                                        <div className='nutritionItem'>
                                                            <p>Белки</p>
                                                            <span>{selectedRecipe.nutrition.proteins}</span>
                                                        </div>
                                                    )}
                                                    {selectedRecipe.nutrition.fats && (
                                                        <div className='nutritionItem'>
                                                            <p>Жиры</p>
                                                            <span>{selectedRecipe.nutrition.fats}</span>
                                                        </div>
                                                    )}
                                                    {selectedRecipe.nutrition.carbs && (
                                                        <div className='nutritionItem'>
                                                            <p>Углеводы</p>
                                                            <span>{selectedRecipe.nutrition.carbs}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            }

                                            {selectedRecipe.ingredients &&
                                                <div className='ingredients'>
                                                    <h3>Ингредиенты</h3>
                                                    {selectedRecipe.ingredients.map((ingredient, index) => (
                                                        <div key={index} className='ingredientItem'>
                                                            <p>{ingredient.name}</p>
                                                            <span>{ingredient.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            }
                                            {selectedRecipe.steps &&
                                                <div className='steps'>
                                                    <h3>Способ приготовления</h3>
                                                    {selectedRecipe.steps.map((step, index) => (
                                                        <div className='step' key={index}>
                                                            <span>Шаг {index + 1}</span>
                                                            <p>{step.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            }

                                            <p className='recipeDescriptionText'>Приятного аппетита!</p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
