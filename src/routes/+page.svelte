<script>
  import { onMount } from 'svelte';

  const chapters = [
    {
      label: 'Introduction',
      stories: [
        { src: '/stories/intro-1.png', width: 375, height: 758, alt: 'Introduction story 1' },
        { src: '/stories/intro-2.png', width: 375, height: 758, alt: 'Introduction story 2' },
        { src: '/stories/intro-3.png', width: 375, height: 758, alt: 'Introduction story 3' }
      ]
    },
    {
      label: 'Work - v0',
      stories: [
        { src: '/stories/work-v0-1.png', width: 375, height: 758, alt: 'Work v0 story 1' },
        { src: '/stories/work-v0-2.png', width: 375, height: 758, alt: 'Work v0 story 2' },
        { src: '/stories/work-v0-3.png', width: 375, height: 758, alt: 'Work v0 story 3' },
        { src: '/stories/work-v0-4.png', width: 375, height: 758, alt: 'Work v0 story 4' }
      ]
    },
    {
      label: 'Figma',
      stories: [{ src: '/stories/figma-1.png', width: 480, height: 758, alt: 'Figma story' }]
    },
    {
      label: 'Me',
      stories: [
        { src: '/stories/me-1.png', width: 375, height: 758, alt: 'Me story 1' },
        { src: '/stories/me-2.png', width: 375, height: 758, alt: 'Me story 2' }
      ]
    },
    {
      label: 'Contact',
      stories: [{ src: '/stories/contact-1.png', width: 375, height: 758, alt: 'Contact story' }]
    }
  ];

  let chapterIndex = 0;
  let storyIndex = 0;
  let direction = 1;
  let touchStartX = 0;
  let touchStartY = 0;

  $: chapter = chapters[chapterIndex];
  $: story = chapter.stories[storyIndex];
  $: storyKey = `${chapterIndex}-${storyIndex}`;
  $: aspect = `${story.width} / ${story.height}`;

  function clampStory(nextChapter, nextStory) {
    const safeChapter = Math.max(0, Math.min(chapters.length - 1, nextChapter));
    const safeStory = Math.max(0, Math.min(chapters[safeChapter].stories.length - 1, nextStory));
    return [safeChapter, safeStory];
  }

  function setStory(nextChapter, nextStory, nextDirection = 1) {
    [chapterIndex, storyIndex] = clampStory(nextChapter, nextStory);
    direction = nextDirection;
    window.history.replaceState(null, '', `#/${chapterIndex}/${storyIndex}`);
  }

  function nextStory() {
    if (storyIndex < chapter.stories.length - 1) {
      setStory(chapterIndex, storyIndex + 1, 1);
      return;
    }

    if (chapterIndex < chapters.length - 1) {
      setStory(chapterIndex + 1, 0, 1);
    }
  }

  function previousStory() {
    if (storyIndex > 0) {
      setStory(chapterIndex, storyIndex - 1, -1);
      return;
    }

    if (chapterIndex > 0) {
      const previousChapter = chapters[chapterIndex - 1];
      setStory(chapterIndex - 1, previousChapter.stories.length - 1, -1);
    }
  }

  function goToChapter(index) {
    setStory(index, 0, index >= chapterIndex ? 1 : -1);
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === ' ') nextStory();
    if (event.key === 'ArrowLeft') previousStory();
    if (event.key === 'ArrowUp') goToChapter(Math.max(0, chapterIndex - 1));
    if (event.key === 'ArrowDown') goToChapter(Math.min(chapters.length - 1, chapterIndex + 1));
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goToChapter(Math.min(chapters.length - 1, chapterIndex + 1));
      if (deltaX > 0) goToChapter(Math.max(0, chapterIndex - 1));
    }
  }

  onMount(() => {
    const [, rawChapter, rawStory] = window.location.hash.match(/^#\/(\d+)\/(\d+)$/) || [];
    if (rawChapter !== undefined && rawStory !== undefined) {
      [chapterIndex, storyIndex] = clampStory(Number(rawChapter), Number(rawStory));
    } else {
      window.history.replaceState(null, '', '#/0/0');
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  <title>Ashesh Gohil Portfolio</title>
</svelte:head>

<main class="site-shell" style:--direction={direction}>
  <nav class="chapter-nav" aria-label="Portfolio sections">
    {#each chapters as item, index}
      <button
        class:active={index === chapterIndex}
        type="button"
        aria-current={index === chapterIndex ? 'page' : undefined}
        on:click={() => goToChapter(index)}
      >
        {item.label}
      </button>
    {/each}
  </nav>

  <section
    class="story-stage"
    aria-label={`${chapter.label} story ${storyIndex + 1}`}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
  >
    <div class="story-phone" style:aspect-ratio={aspect}>
      {#key storyKey}
        <img class="story-image" src={story.src} width={story.width} height={story.height} alt={story.alt} />
      {/key}

      <button class="tap-zone tap-left" type="button" aria-label="Previous story" on:click={previousStory}></button>
      <button class="tap-zone tap-right" type="button" aria-label="Next story" on:click={nextStory}></button>
    </div>
  </section>
</main>
