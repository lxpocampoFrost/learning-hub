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

                mainStoryContainerClass.querySelector(storyPanelClass).remove();
                
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

})();

//Quiz
$(function() {
    console.log( "quiz ready!" );
    
     $($('.question-item').get().reverse()).each(function(index) {
				$(this).attr('data-order', index + 1);
        let questionNumber = $(this).children('.question-header').find('.question-number .question-number-stats');
        questionNumber.text($(this).attr('data-order'));
    });
    
    let totalQuizItems =  $('.question-list').children().length;
    let resultContent = $('.result-content');
    let quizStatus = $('.quiz-result');

    let correctAnswers = 0; 
    let answeredQuestions;
   

    $('.option').on('click', function () {
        let $this = $(this);
        let selectedAnswer = $this.attr('data-option');
        let status = $this.parent().siblings('.w-embed').find('.status').text();
        $this.addClass('selected');
        $this.parent().addClass('disabled');   
        $this.siblings().css('opacity', 0.6);
        $this.parent().siblings(".next-question-block").css("display", "flex");
        $this.parent().parent().addClass('answered');
       
        if (status === selectedAnswer) {
         	$this.find('.options-wrap').children('.option-letter').hide();
          $this.find('.options-wrap').children('.option-correct').show();

          correctAnswers++;
          
        } else {
            $this.find('.options-wrap').children('.option-letter').hide();
            $this.find('.options-wrap').children('.option-incorrect').show();

            $(this).siblings('.option').each(function () {
                if ($(this).attr('data-option') === status) {
                    $(this).css('opacity', 1);
                    $(this).find('.options-wrap').children('.option-letter').hide();
                    $(this).find('.options-wrap').children('.option-correct').show();
            
                } 
            });	
        }

        updateAnswerCount();

         if (answeredQuestions === totalQuizItems) {
            $('.next-question').text('Finish');
            setTimeout(() => {
           const quizResult = computePercentage(correctAnswers, totalQuizItems);
           console.log('result', quizResult);

           $('.totalscore').text(correctAnswers);
           $('.totalitems').text(totalQuizItems);

            if(quizResult >= 65){
                quizStatus.text('Passed');
                $('.quiz-result-img.guru').show();
                resultContent.text('You have a strong understanding of financial concepts. Keep honing your skills, and you might become a financial guru in no time!')
            } else {
                 quizStatus.text('Failed');
                 $('.quiz-result-img.novice').show();
                resultContent.text(`You're just starting your financial journey. Consider 
                checking the following article to boost your knowledge.`)
            }
            }, 300);
         }
    });
    
    $('.next-question-block').on('click',function() {   
      $('.question_list').delay(0).animate({
        translateX: -50+'em',
      },{ duration: 300, queue: false },'linear');
    });

     function updateAnswerCount() {
        answeredQuestions = $(".answered").length;
        let progressWidth = (answeredQuestions / totalQuizItems) * 100;
        $(".quiz-progress").css("width", progressWidth + "%");
 
    }
    
    updateAnswerCount()

    function computePercentage(score, totalItems) {
        return (score / totalItems) * 100;
    }

});

let allInvisibleItems = document.querySelectorAll('.w-condition-invisible');
let allEmptyItems = document.querySelectorAll('.series-content-name.w-dyn-bind-empty');
let allItemTitles = document.querySelectorAll('.series-content-name');

let contentTitles = [];

allEmptyItems.forEach((item) => {
    item.remove();
})

allInvisibleItems.forEach((item) => {
    item.remove();
})

allItemTitles.forEach((element) => {
    console.log(element.textContent);

    if(!contentTitles.includes(element.textContent) && !element.classList.contains("w-dyn-bind-empty")) {
        contentTitles.push(element.textContent);
    }
})

//Change nav items to right names
let seriesNavItem = document.querySelector('.series-nav-item').cloneNode(true);
let seriesNav = document.querySelector('.series-nav');

document.querySelector('.series-nav-item').remove();

contentTitles.map((name, index) => {
	let newItem = seriesNavItem.cloneNode(true);
    
    newItem.querySelector('.series-nav-item-name').textContent = name;
    console.log(newItem);
    
    seriesNav.appendChild(newItem);
})

let seriesContentItems = document.querySelectorAll('.series-content-list-item');

function getFirstWord(str) {
    let words = str.split(' ');
    return words[0];
}

seriesContentItems.forEach((item, index) => {
    item.setAttribute('id',`${getFirstWord(contentTitles[index])}`);
})

document.querySelectorAll('.series-nav-item').forEach((item, index) => {
    item.setAttribute('href', `#${getFirstWord(contentTitles[index])}`);
})
