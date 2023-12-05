(function () {
    const mainContainerClass = '.story-container';

    const mainBarContainerClass = '.stories-bar-wrap';
    const barClass = '.stories-bar';
    const progressBarClass = '.stories-progress';

    const storyPanelClass = '.story';

    let storiesCollection = [];
    let highlightMainlist = [];

    let currentHighlight = document.querySelector('.story-container.current-highlight');
    let initialHighlightItems = document.querySelector('.highlight-loader').querySelectorAll('.highlight-list-item');
    let highlightLoader = document.querySelector('.highlight-loader');

    highlightMainlist.push(currentHighlight);

    function createStoryPanels() {
        const storyMainContainer = document.querySelectorAll(mainContainerClass);
        const progressBar = storyMainContainer[0].querySelector(barClass).cloneNode(true);
        
        storyMainContainer.forEach((container, index) => {
            if(storiesCollection.includes(container) == false) {
               
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

                    if(windowSize > 1024) {
                        container.addEventListener('mousedown', (e) => {
                            setEventData(e)
                        });
            
                        container.addEventListener('mouseup', setContainerControls);
                    } else {
                        container.addEventListener('touchstart', (e) => {
                            setEventData(e)
                        });
            
                        container.addEventListener('touchend', setContainerControls);
                    }
                    
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

                    if(windowSize > 1024) {
                        container.removeEventListener('mouseup', setContainerControls);
                    } else {
                        container.removeEventListener('touchend', setContainerControls);
                    }
                }
            });
        }, options);

        // observer.root.style.border = "2px solid #44aa44";

        // Start observing the element
        observer.observe(container);
    }

    function setLoadMore (container) {
        container.addEventListener('scroll', function() {
              progress = (container.scrollTop / ( container.scrollHeight - window.innerHeight ) ) * 100;
              console.log(progress);
              if(progress > 98) {
                      console.log('Past 96!');
                  if(!$('#highlight-next')[0].getAttribute('style')) {
                          console.log('clicked!');
                      $('#highlight-next')[0].click();
                  } 
              }
          });
    }

    //Everytime infinite scroll loads a new item, create a stories panel
    window.fsAttributes = window.fsAttributes || [];
    window.fsAttributes.push([
    'cmsload',
    (listInstances) => {   
            const [listInstance] = listInstances;

            let scrollContainer = document.querySelector('.highlight-scroll-container');
            initialHighlightItems = document.querySelector('.highlight-loader').querySelectorAll('.highlight-list-item')
            
            initialHighlightItems.forEach((item) => {
                highlightMainlist.push(item);
                scrollContainer.append(item);
            })

            setLoadMore(scrollContainer);
            createStoryPanels();
            
            listInstance.on('renderitems', (renderedItems) => {
               
                renderedItems.map((item) => {
                    if(!highlightMainlist.includes(item.element)) {
                        highlightMainlist.push(item.element);
                        scrollContainer.append(item.element);
                    }
                })
          
                highlightLoader.remove();
                createStoryPanels();
            });
        },
    ]);


})();
