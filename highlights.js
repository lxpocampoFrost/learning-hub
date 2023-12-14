class Highlights {
    constructor() {
        this.observerOptions = { root: null, threshold: 1,}
        this.observer = new IntersectionObserver(this.observerCallback, this.observerOptions);

        this.scrollContainer = document.querySelector('.lh-highlight-scroll-container');
        this.scrollContainer.childNodes.forEach((node) => {
            Highlights.addBars(node);
            this.displayPanel(node.querySelector('.lh-story'));
            this.attachSocialLink(node);
            this.addAnimation(node);
            this.addTargetToObserver(node);
            this.addNodeControls(node);
        });

        this.loader = document.querySelector('.lh-highlight-loader');
    }

    static windowSize = window.innerWidth;
    static animationList = [];
    static interactionThreshold = 200;
    static currentIndex = 0;
    static eventStartTime;
    static coordsX;
    static currentNodeInView;

    addNodeToList(node) {
        if(node != null) {
            Highlights.addBars(node);
            this.displayPanel(node.querySelector('.lh-story'));
            this.attachSocialLink(node);
            this.addAnimation(node);
            this.addTargetToObserver(node);
            this.addNodeControls(node);
            this.scrollContainer.append(node);
        } 
    }

    addNodeControls(node) {
        if(Highlights.windowSize > 1024) {
            node.addEventListener('mousedown', (event) => {
                if(Highlights.currentNodeInView.node == node) {
                    Highlights.setEvent(event, Highlights.currentNodeInView.animations);
                }
            })
    
            node.addEventListener('mouseup', () => {
                if(Highlights.currentNodeInView.node == node) {
                    Highlights.setupContainerControls(
                        Highlights.currentNodeInView.node,
                        Highlights.currentNodeInView.animations, 
                        Highlights.currentNodeInView.panels
                    );
                }
            })
        } else {
            node.addEventListener('touchstart', (event) => {
                if(Highlights.currentNodeInView.node == node) {
                    Highlights.setEvent(event.touches[0], Highlights.currentNodeInView.animations);
                }
            })

            node.addEventListener('touchend', () => {
                if(Highlights.currentNodeInView.node == node) {
                    Highlights.setupContainerControls(
                        Highlights.currentNodeInView.node,
                        Highlights.currentNodeInView.animations, 
                        Highlights.currentNodeInView.panels
                    );
                }
            })
        }
    }

    displayPanel(highlightNode) {
        highlightNode.style.opacity = 1;
        highlightNode.style.zIndex = 2;
    }

    hidePanel(highlightNode) {
        highlightNode.style.opacity = 0;
        highlightNode.style.zIndex = 0;
    }

    observerCallback(entries) {
        let scrollContainer = document.querySelector('.lh-highlight-scroll-container');
        let scrollContainerLength = document.querySelector('.lh-highlight-scroll-container').children.length;
        
        entries.forEach((element, index) => {
            let elementAnimation = Highlights.animationList.find(item => item.node == element.target);
            Highlights.currentIndex = 0;

            elementAnimation.animations.map((item, index) => {
                item.cancel();
                item.pause();
            })
            
            if (element.isIntersecting) { 
                //Infinite scroll - auto click next
                if(scrollContainerLength > 1) {
                    let index =  [...scrollContainer.children].indexOf(element.target);

                    if(index == scrollContainerLength - 1) {

                        if($('#highlight-next').length > 0){
                            if(!$('#highlight-next')[0].getAttribute('style')) {
                                $('#highlight-next')[0].click();
                            }
                            element.target.scrollIntoView();
                        }
                    }
                }

                elementAnimation.animations.map((item, index) => {
                    if(index < 1) {
                        item.play();
                    }
                    
                    if(index < elementAnimation.animations.length - 1) {
                        item.onfinish = function () {
                            elementAnimation.animations[index + 1].play();
                            elementAnimation.panels[index + 1].style.zIndex = 2;  
                            elementAnimation.panels[index + 1].style.opacity = 1; 
                            Highlights.currentIndex = index + 1;
                        }
                    }
                })

                Highlights.setCurrentNode(elementAnimation);

            } else {    
                elementAnimation.panels[Highlights.currentIndex].style.zIndex = 2;
                elementAnimation.panels[Highlights.currentIndex].style.opacity = 1;
                elementAnimation.panels[Highlights.currentIndex].position = 'relative';

                elementAnimation.animations.map((item, index) => {
                    item.cancel();
                    item.pause();    

                    if(index > 0) {
                        elementAnimation.panels[index].style.zIndex = 0;  
                        elementAnimation.panels[index].style.opacity = 0; 
                    }
                   
                    item.onfinish = function () {};
                });   
                
                $('.lh-highlight-controls-container').removeClass('lh-active-vertical');
                $('.lh-highlight-controls-container').children('.lh-social-icon').css('display', 'none');
                $('.lh-highlight-controls-container').children('.lh-display-icon').css('display', 'flex');
            }   
        });
    }

    addTargetToObserver(node) {
        this.observer.observe(node);
    }

    addAnimation(node) {
        const progresBarMove = [
            {width: "0%"},
            {width: "100%"}
        ]

        let progressBars = node.querySelectorAll('.lh-highlights-progress');
        let panels = node.querySelectorAll('.lh-story');

        let animationObject = {
            node: node,
            animations: [],
            panels: panels,
        }

        progressBars.forEach((bar, index) => {
            animationObject.animations.push(bar.animate(progresBarMove, {
                duration: 3000,
                fill: "forwards",
            }));
        })

        Highlights.animationList.push(animationObject);
    }

    attachSocialLink(node) {
        const fbLinkElement = node.querySelector('[data-social="facebook"]');
        const twitterLinkElement = node.querySelector('[data-social="twitter"]');

        let slug = node.querySelector('.highlight-slug').textContent;
        let baseUrl = window.location.origin;
        let facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${baseUrl}/usapangpera/highlights/${slug}`;
        let twitterURL = `https://twitter.com/intent/tweet?url=${baseUrl}/usapangpera/highlights/${slug}`; 

        fbLinkElement.href = facebookURL;
        twitterLinkElement.href = twitterURL;
    }

    static setEvent(event, elementAnimation) {
        let rect =  event.target.getBoundingClientRect();
        
        this.eventStartTime = Date.now();
        
        Highlights.coordsX =  event.clientX - rect.left;

        elementAnimation[Highlights.currentIndex].pause(); 
    }

    static setupContainerControls(node, elementAnimation, elementStoryPanel) {
        let eventDuration = Date.now() - this.eventStartTime;
        let clickAreaAllocation = Math.ceil(0.20 * node.getBoundingClientRect().width);
    
        if(eventDuration < Highlights.interactionThreshold) {
            if(Highlights.coordsX < clickAreaAllocation) {
                //Previous
                if(Highlights.currentIndex > 0 ) {
                    elementAnimation[Highlights.currentIndex].cancel();
                    elementAnimation[Highlights.currentIndex - 1].play();
                    elementStoryPanel[Highlights.currentIndex].style.zIndex = 0;
                    elementStoryPanel[Highlights.currentIndex].style.opacity = 0;
                    elementStoryPanel[Highlights.currentIndex - 1].style.zIndex = 2;
                    elementStoryPanel[Highlights.currentIndex - 1].style.opacity = 1;
                    Highlights.currentIndex = Highlights.currentIndex - 1
                }
            } else {
                //Next 
                if(Highlights.currentIndex != elementAnimation.length - 1 ) {
                    elementAnimation[Highlights.currentIndex].finish();
                    elementAnimation[Highlights.currentIndex + 1].play();
                    elementStoryPanel[Highlights.currentIndex].style.zIndex = 0;
                    elementStoryPanel[Highlights.currentIndex].style.opacity = 0;
                    elementStoryPanel[Highlights.currentIndex + 1].style.zIndex = 2;
                    elementStoryPanel[Highlights.currentIndex + 1].style.opacity = 1;
                    elementStoryPanel[Highlights.currentIndex + 1].style.opacity = 'relative';
                    Highlights.currentIndex = Highlights.currentIndex + 1;
                }
            }
        } 
        
        elementAnimation[Highlights.currentIndex].play();
    }

    static setCurrentNode(nodeObject) {
        Highlights.currentNodeInView = nodeObject;
    }

    static addBars(node) {
        let progressBarContainer = node.querySelector('.lh-stories-bar-wrap');
        let progressBarTemplate;

        node.querySelectorAll('.lh-story').forEach((element) => {
            progressBarTemplate = document.querySelector('.lh-highlights-bar').cloneNode(true);
            progressBarContainer.append(progressBarTemplate);
        })
    }
}

let highlights = new Highlights();

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
'cmsload',
(listInstances) => {   
        const [listInstance] = listInstances;

        highlights.loader.querySelectorAll('.lh-highlight-list-item > .lh-story-container').forEach((node) => {
            highlights.addNodeToList(node);
        });
    
        listInstance.on('renderitems', (renderedItems) => {
            renderedItems.map((item) => {
                highlights.addNodeToList(item.element.querySelector('.lh-story-container'));
            })
        });
    },
]);
