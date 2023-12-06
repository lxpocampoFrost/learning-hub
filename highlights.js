(function () {
    const mainContainerClass = '.story-container';

    const mainBarContainerClass = '.stories-bar-wrap';
    const barClass = '.stories-bar';
    const progressBarClass = '.stories-progress';

    const mainStoryContainerClass = '.story-wrap';
    const storyPanelClass = '.story';

    let storiesCollection = [];
    let highlightMainlist = [];
    let scrollContainerChildren = [];

    let currentHighlight = document.querySelector('.story-container.current-highlight');
    let scrollContainer = document.querySelector('.highlight-scroll-container');
    let scrollContainerLength = 1;

    let initHighlightItems = document.querySelector('.highlight-loader').querySelectorAll('.highlight-list-item');
    let highlightLoader = document.querySelector('.highlight-loader');


    highlightMainlist.push(currentHighlight);

    function createStoryPanels() {
        const storyMainContainer = document.querySelectorAll(mainContainerClass);
        const progressBar = storyMainContainer[0].querySelector(barClass).cloneNode(true);
        
        storyMainContainer.forEach((container, index) => {
            if(storiesCollection.includes(container) == false) {
               
                let storyWrap = container.querySelector(mainStoryContainerClass);
                let storyBarWrap = container.querySelector(mainBarContainerClass);
                let storyContent = container.querySelectorAll(`${storyPanelClass}`);

                storyContent.forEach((content, index) => {
                    storyBarWrap.appendChild(progressBar.cloneNode(true));
                });

                if(container.querySelector(barClass)) {
                    container.querySelector(barClass).remove();
                }

                storiesCollection.push(container);
            }
        })  

        storiesCollection.forEach((story, index) => {
            animateStories(story)
        })
    }

    function animateStories(container) {
        let options = {
            root: null,
            threshold: 1,
        }

        const progresBarMove = [
            {width: "0%"},
            {width: "100%"}
        ]

        let progressBars = container.querySelectorAll(progressBarClass);
        let storiesPanel = container.querySelectorAll(storyPanelClass);
        let defaultDuration = 3000;
        
        let animations = [];
        let panelDurations = [];

        let windowSize = window.innerWidth;
        let storyContainerWidth = container.getBoundingClientRect().width;

        let clickAreaAllocation = Math.ceil(0.20 * storyContainerWidth);
       
        let currentStory = 0;
        let interactionThreshold = 200;
        let eventStartTime, coordsX;

        storiesPanel.forEach((panel) => {
            if(panel.getAttribute('data-duration')) {
                panelDurations.push(parseInt(panel.getAttribute('data-duration')));
            } else {
                panelDurations.push(defaultDuration);
            }
        })

        progressBars.forEach((bar, index) => {
            animations.push(bar.animate(progresBarMove, {
                duration: panelDurations[index],
                fill: "forwards",
            }));

            if(index != progressBars.length - 1) {
                animations[index].onfinish = function () {
                    animations[index + 1].play();
                    storiesPanel[index + 1].style.zIndex = 2;  
                    storiesPanel[index + 1].style.opacity = 1;  
                    currentStory = index + 1;
                }
            } 
        })

        //Add controls
        function setEventData(event) {
            let rect = event.target.getBoundingClientRect();
                
            eventStartTime = Date.now();
            
            coordsX = event.clientX - rect.left;

            animations[currentStory].pause(); 
        }

        function setContainerControls() {
            let eventDuration = Date.now() - eventStartTime;
                if(eventDuration < interactionThreshold) {
                    if(coordsX < clickAreaAllocation) {
                        //Previous
                        if(currentStory > 0 ) {
                            animations[currentStory].cancel();
                            animations[currentStory - 1].play();
                            storiesPanel[currentStory].style.zIndex = 0;
                            storiesPanel[currentStory].style.opacity = 0;
                            storiesPanel[currentStory - 1].style.zIndex = 2;
                            storiesPanel[currentStory - 1].style.opacity = 1;
                            currentStory = currentStory - 1
                        }
                    } else {
                        //Next 
                        if(currentStory != animations.length - 1 ) {
                            animations[currentStory].finish();
                            animations[currentStory + 1].play();
                            storiesPanel[currentStory].style.zIndex = 0;
                            storiesPanel[currentStory].style.opacity = 0;
                            storiesPanel[currentStory + 1].style.zIndex = 2;
                            storiesPanel[currentStory + 1].style.opacity = 1;
                            currentStory = currentStory + 1;
                        }
                    }
                } 
                
                animations[currentStory].play();
        }
    
        var observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach((element) => {
               
                if (element.isIntersecting) { 
                    let elemName;
                    let index =  [...scrollContainer.children].indexOf(element.target);

                    if(index < 0) {
                        index =  [...scrollContainer.children].indexOf(element.target.parentNode);
                    }

                    if(index == scrollContainerLength - 1) {
                        elemName = element.target.querySelector('.highlight-title').textContent;
                        if(!$('#highlight-next')[0].getAttribute('style')) {
                            $('#highlight-next')[0].click();
                        }
                        // element.target.scrollIntoView();
                    } else {
                        elemName = element.target.querySelector('.highlight-title').textContent;
                        console.log(elemName);
                    }
                    
                    animations.map((item, index) => {
                        if(index > 0 ) {
                            animations[index].cancel();
                            animations[index].pause();
                        } else {
                            
                            animations[index].play();
                            storiesPanel[0].style.zIndex = 2;
                            storiesPanel[0].style.opacity = 1;
                            currentStory = 0;
                        }
                    })   

                    if(windowSize > 1024) {
                        container.addEventListener('mousedown', (e) => {
                            setEventData(e)
                        });
            
                        container.addEventListener('mouseup', setContainerControls);
                    } else {
                        container.addEventListener('touchstart', (e) => {
                            setEventData(e.touches[0]);
                        });
            
                        container.addEventListener('touchend', setContainerControls);
                    }

                } else {
                    animations.map((item, index) => {
                        animations[index].cancel();
                        animations[index].pause();
                        if(index > 0) {
                            storiesPanel[index].style.zIndex = 0;
                            storiesPanel[index].style.opacity = 0;
                        } else {
                            storiesPanel[index].style.zIndex = 2;
                            storiesPanel[index].style.opacity = 1;
                        }
                        currentStory = 0;
                    })  

                    if(windowSize > 1024) {
                        container.removeEventListener('mouseup', setContainerControls);
                    } else {
                       
                        container.removeEventListener('touchend', setContainerControls);
                    }
                }        
            });
          
        }, options);

        // Start observing the element
        observer.observe(container);
    }

    //Everytime infinite scroll loads a new item, create a stories panel
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
    'cmsload',
    (listInstances) => {   
            const [listInstance] = listInstances;

            initHighlightItems = document.querySelector('.highlight-loader').querySelectorAll('.highlight-list-item');
            
            initHighlightItems.forEach((item) => {
                highlightMainlist.push(item);
                scrollContainer.append(item);
            })

            // setLoadMore(scrollContainer);
            console.log(scrollContainer.children);
            scrollContainerLength = scrollContainer.children.length;
            createStoryPanels();

            listInstance.on('renderitems', (renderedItems) => {
                renderedItems.map((item) => {
                    if(!highlightMainlist.includes(item.element)) {
                        highlightMainlist.push(item.element);
                        scrollContainer.append(item.element);
                    }
                })
               
                scrollContainerLength = scrollContainer.children.length;
                highlightLoader.remove();
                createStoryPanels();
            });
        },
    ]);


})();
