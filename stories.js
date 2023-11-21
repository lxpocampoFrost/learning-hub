(function () {
    const mainContainerClass = '.story-container';

    const mainBarContainerClass = '.stories-bar-wrap';
    const barClass = '.stories-bar';
    const progressBarClass = '.stories-progress';

    const mainStoryContainerClass = '.story-wrap';
    const storyContentContainerClass = '.stories-content';
    const storyPanelClass = '.story';

    function createStoryPanels() {
        const storyMainContainer = document.querySelectorAll(mainContainerClass);
        const progressBar = storyMainContainer[0].querySelector(barClass).cloneNode(true);

        let storiesCollection = [];
        
        storyMainContainer.forEach((container, index) => {
            if(storiesCollection.includes(container) == false) {
                let storyWrap = container.querySelector(mainStoryContainerClass);
                let storyBarWrap = container.querySelector(mainBarContainerClass);
                let storyContent = container.querySelectorAll(`${storyContentContainerClass} > ${storyPanelClass}`);
                
                storyContent.forEach((content, index) => {
                    storyWrap.appendChild(content);
                    storyBarWrap.appendChild(progressBar.cloneNode(true));
                });

                container.querySelector(storyContentContainerClass).remove();
                container.querySelector(barClass).remove();

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
            threshold: 0.8,
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
        let interactionThreshold = 100;
        let eventStartTime, coordsX;

        // console.log('storyContainerWidth: ', storyContainerWidth);
        // console.log('clickAreaAllocation', clickAreaAllocation);
        // console.log(storyContainerWidth * clickAreaAllocation);

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
                            storiesPanel[currentStory - 1].style.zIndex = 2;
                            currentStory = currentStory - 1
                        }
                    } else {
                        //Next 
                        if(currentStory != animations.length - 1 ) {
                            animations[currentStory].finish();
                            animations[currentStory + 1].play();
                            storiesPanel[currentStory].style.zIndex = 0;
                            storiesPanel[currentStory + 1].style.zIndex = 2;
                            currentStory = currentStory + 1;
                        }
                    }
                } 
                
                animations[currentStory].play();
        }

        if(windowSize > 1024) {
            container.addEventListener('mousedown', (e) => {
                setEventData(e);
            })

            container.addEventListener('mouseup', (e) => {
                setContainerControls();
            })
        } else {
            container.addEventListener('touchstart', (e) => {
                setEventData(e);
            })

            container.addEventListener('touchend', () => {
                setContainerControls();
            })
        }

        var observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach((element) => {
                if (element.isIntersecting) {  
                   
                    animations.map((item, index) => {
                        if(index > 0 ) {
                            animations[index].cancel();
                            animations[index].pause();
                        } else {
                            animations[index].play();
                            storiesPanel[0].style.zIndex = 2;
                            currentStory = 0;
                        }
                    })   
                } else {
                    
                    animations.map((item, index) => {
                        animations[index].cancel();
                        animations[index].pause();
                        if(index > 0) {
                            storiesPanel[index].style.zIndex = 0;
                        } else {
                            storiesPanel[index].style.zIndex = 2;
                        }
                        currentStory = 0;
                    })  
                }
            });
        }, options);

        // observer.root.style.border = "2px solid #44aa44";

        // Start observing the element
        observer.observe(container);
    }

    createStoryPanels();

    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
    'cmsload',
    (listInstances) => {   
            // The callback passes a `listInstances` array with all the `CMSList` instances on the page.
            const [listInstance] = listInstances;
                
            // The `renderitems` event runs whenever the list renders items after switching pages.
            listInstance.on('renderitems', (renderedItems) => {
                createStoryPanels();
            });
        },
    ]);

})();
