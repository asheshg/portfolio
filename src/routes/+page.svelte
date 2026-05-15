<script>
  import { onMount } from 'svelte';

  const chapters = [
    {
      label: 'Introduction',
      stories: [
        {
          visual: 'intro-1',
          stickers: [
            { text: 'Hi! 👋\nI am Ashesh.', x: 41, y: 136, w: 140, size: 24, rotate: 7 },
            { text: 'This is my website. It’s like IG stories.', x: 54, y: 460, w: 264, size: 16, rotate: 8 },
            { text: 'Tap to navigate, or swipe to skip sections.', x: 56, y: 651, w: 294, size: 16, rotate: 8 }
          ]
        },
        {
          visual: 'intro-2',
          stickers: [
            {
              text: 'I am a UI/UX designer or a digital product designer.',
              x: 34,
              y: 96,
              w: 279,
              size: 24,
              rotate: 1
            },
            {
              text: 'It mostly involves designing and redesigning websites and apps. Sometimes with AI.',
              x: 67,
              y: 567,
              w: 236,
              size: 16,
              rotate: 13
            }
          ]
        },
        {
          visual: 'intro-3',
          stickers: [
            { text: 'I currently work at pwc_india.', x: 25, y: 328, w: 317, size: 24, rotate: 5 },
            { text: 'Before that, I worked at', x: 33, y: 524, w: 169, size: 16, rotate: 9 },
            { text: '@yellowslice', x: 44, y: 582, w: 93, size: 16, rotate: 9 },
            { text: '@wayfair', x: 155, y: 569, w: 68, size: 16, rotate: 9 },
            { text: '@ransmeier', x: 243, y: 551, w: 87, size: 16, rotate: 9 },
            { text: '@risd1877', x: 52, y: 640, w: 78, size: 16, rotate: 9 }
          ]
        }
      ]
    },
    {
      label: 'Work - v0',
      stories: [
        {
          visual: 'work-1',
          collage: true,
          stickers: [
            {
              text: 'I recently redesigned 4 major modules for a CRM of a leading Indian bank.',
              x: 43,
              y: 116,
              w: 279,
              size: 24,
              rotate: 1
            },
            { text: 'Covered by NDA 🤐', x: 120, y: 452, w: 139, size: 16, rotate: 5 }
          ]
        },
        {
          visual: 'work-2',
          stickers: [
            {
              text: 'At yellowslice, I redesigned the mutualfundssahihai website.',
              x: 88,
              y: 64,
              w: 226,
              size: 16,
              rotate: 7
            },
            {
              text: 'And an ERP for construction management teams.',
              x: 70,
              y: 309,
              w: 203,
              size: 16,
              rotate: 5
            },
            {
              text: 'I also designed a govt visitor management app.',
              x: 74,
              y: 526,
              w: 236,
              size: 16,
              rotate: 15
            }
          ]
        },
        {
          visual: 'work-3',
          stickers: [
            {
              text: "And allmodern's store locations page for their first ever physical retail store at wayfair.",
              x: 22,
              y: 102,
              w: 321,
              size: 16,
              rotate: 9
            },
            {
              text: 'Along with streamlining an internal tool to just one click.',
              x: 70,
              y: 488,
              w: 236,
              size: 16,
              rotate: 10
            }
          ]
        },
        {
          visual: 'work-4',
          stickers: [
            {
              text: 'Also designed (& pitched) a pitch deck to help an NGO win a grant.',
              x: 47,
              y: 238,
              w: 279,
              size: 16,
              rotate: 9
            },
            { text: 'You can watch it here', x: 118, y: 308, w: 152, size: 16, rotate: 9 },
            {
              text: 'Which also got featured in Rhode Island Medical Journal',
              x: 66,
              y: 606,
              w: 220,
              size: 16,
              rotate: 8
            }
          ]
        }
      ]
    },
    {
      label: 'Figma',
      stories: [
        {
          visual: 'figma-1',
          collage: true,
          stickers: [
            { text: 'I made this site on Figma.', x: 50, y: 143, w: 276, size: 24, rotate: 0 },
            {
              text: 'Implemented it with some more tools (and AI).',
              x: 69,
              y: 198,
              w: 236,
              size: 16,
              rotate: 0
            },
            { text: 'Check it out here', x: 98, y: 621, w: 179, size: 24, rotate: 4 }
          ]
        }
      ]
    },
    {
      label: 'Me',
      stories: [
        {
          visual: 'me-1',
          stickers: [
            {
              text: 'When I am not working, I am exploring museums or exhibitions.',
              x: 65,
              y: 102,
              w: 245,
              size: 16,
              rotate: 3
            }
          ]
        },
        {
          visual: 'me-2',
          stickers: [
            { text: 'Or making stuff with glass.', x: 108, y: 289, w: 190, size: 16, rotate: 4 },
            {
              text: 'Or just making or repairing something.',
              x: 80,
              y: 583,
              w: 273,
              size: 16,
              rotate: 6
            }
          ]
        }
      ]
    },
    {
      label: 'Contact',
      stories: [
        {
          visual: 'contact-1',
          stickers: [
            {
              text: 'If you have reached here, don’t forget to say hello!',
              x: 67,
              y: 166,
              w: 234,
              size: 24,
              rotate: 0
            },
            { text: 'LinkedIn', x: 156, y: 547, w: 62, size: 16, rotate: 0 },
            { text: '@asheshgohil', x: 138, y: 593, w: 99, size: 16, rotate: 0 }
          ]
        }
      ]
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
    <div class="story-phone">
      {#key storyKey}
        <article class={`story-frame ${story.visual}`}>
          <div class="photo-scene" aria-hidden="true">
            <span class="person-head"></span>
            <span class="person-body"></span>
            <span class="scene-line scene-line-a"></span>
            <span class="scene-line scene-line-b"></span>
            {#if story.collage}
              <span class="mock mock-a"></span>
              <span class="mock mock-b"></span>
              <span class="mock mock-c"></span>
              <span class="thumb thumb-a"></span>
              <span class="thumb thumb-b"></span>
              <span class="thumb thumb-c"></span>
            {/if}
          </div>

          <div class="top-scrim"></div>

          <div class="progress-row" aria-hidden="true">
            {#each chapter.stories as item, index}
              <span class:complete={index < storyIndex} class:current={index === storyIndex}></span>
            {/each}
          </div>

          <header class="story-header">
            <span class="avatar" aria-hidden="true"></span>
            <span class="username">asheshgohil</span>
            <span class="verified" aria-hidden="true">✓</span>
            <span class="time">11h</span>
            <span class="options" aria-hidden="true">•••</span>
            <span class="close" aria-hidden="true">×</span>
          </header>

          {#each story.stickers as sticker}
            <p
              class="sticker"
              class:large={sticker.size >= 24}
              style={`left:${sticker.x / 3.75}%;top:${sticker.y / 7.58}%;width:${sticker.w / 3.75}%;--r:${sticker.rotate}deg;`}
            >
              {sticker.text}
            </p>
          {/each}
        </article>
      {/key}

      <button class="tap-zone tap-left" type="button" aria-label="Previous story" on:click={previousStory}></button>
      <button class="tap-zone tap-right" type="button" aria-label="Next story" on:click={nextStory}></button>
    </div>
  </section>
</main>
