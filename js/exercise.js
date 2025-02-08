$(document).ready(function () {
    // 상위 카테고리 상태
    let currentCategory = '일상';

    // 상위 카테고리 탭 클릭 시
    function showExercise(exercise) {
        currentCategory = exercise; // 현재 선택된 상위 카테고리 저장

        // 모든 상위 카테고리 버튼 비활성화
        $('.tab-button').removeClass('active');
        // 클릭한 상위 카테고리 버튼만 활성화
        $(`.tab-button[data-category="${exercise}"]`).addClass('active');

        // 하위 카테고리 선택 초기화
        $('.sub-tab-button').removeClass('active');
        $('.exercise-content').html('<p>하위 카테고리를 선택해주세요.</p>');
    }

    // 하위 카테고리 탭 클릭 시
    function showVideo(subcategory) {
        // 모든 하위 카테고리 버튼 비활성화
        $('.sub-tab-button').removeClass('active');
        // 클릭한 하위 카테고리 버튼만 활성화
        $(`.sub-tab-button[data-subcategory="${subcategory}"]`).addClass('active');

        // 선택된 하위 카테고리와 현재 상위 카테고리를 기준으로 영상 표시
        const videoHtml = getVideoHtml(currentCategory, subcategory);
        $('.exercise-content').html(videoHtml);
    }

    // 상위 카테고리와 하위 카테고리를 기준으로 영상 HTML 생성
    function getVideoHtml(category, subcategory) {
        const videos = {
            일상: {
                arms: `<iframe width="560" height="315" src="https://www.youtube.com/embed/9lRQzX7pD_k?si=RYO7ouoPd_ahTD4w" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
                abs: `<iframe width="560" height="315" src="https://www.youtube.com/embed/jj6ze_eqmYI?si=P5RPj7ZQ1JfmK9uk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
                legs: `<iframe width="560" height="315" src="https://www.youtube.com/embed/YIaJWBmGSoc?si=0rNeay_tA78CY_lf" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            },
            스트레칭: {
                arms: `<iframe width="560" height="315" src="https://www.youtube.com/embed/BowfGEVE2eU?si=o7-c6LTrPcq2Ww0F" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
                abs: `<iframe width="560" height="315" src="https://www.youtube.com/embed/Temb680H_1Q?si=Ny1OYUUva4CjkaEt" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
                legs: `<iframe width="560" height="315" src="https://www.youtube.com/embed/fR5psj9Yl2E?si=D21UrH59NwRgWF40&amp;start=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
            },
            헬스: {
                arms: `<iframe width="560" height="315" src="https://www.youtube.com/embed/qkQdIMW1xlw?si=6EyTRiR4RohyDqVl" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
                abs: `<iframe width="560" height="315" src="https://www.youtube.com/embed/ZNTEESAxy4M?si=1nE8Toa1gTqjJFVw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
                legs: `<iframe width="560" height="315" src="https://www.youtube.com/embed/KXYi6bI-UPE?si=kMwTCkxh8iQokX4z" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`,
            },
        };

        // 해당 카테고리와 하위 카테고리의 영상이 존재하면 반환, 없으면 기본 메시지 반환
        return videos[category]?.[subcategory] || '<p>영상이 준비되지 않았습니다.</p>';
    }

    // 상위 카테고리 클릭 이벤트
    $('.tab-button').click(function () {
        const exercise = $(this).data('category'); // data-category 값 가져오기
        showExercise(exercise);
    });

    // 하위 카테고리 클릭 이벤트
    $('.sub-tab-button').click(function () {
        const subcategory = $(this).data('subcategory'); // data-subcategory 값 가져오기
        showVideo(subcategory);
    });

    // 초기 상태 설정
    showExercise('일상');
});
