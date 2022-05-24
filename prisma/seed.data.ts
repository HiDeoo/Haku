import { TodoNodeStatus } from '@prisma/client'

import { type FoldersSeedDefinition, type NoteSeedDefinition, type TodoSeedDefinition } from './seed'

import { ContentType } from 'constants/contentType'

const folderNames = {
  NOTE_RECIPES: 'Recipes',
  NOTE_TECH: 'Tech',
  TODO_PROJECTS: 'Projects',
  TODO_ARCHIVES: 'Archives',
}

export const foldersToSeed: FoldersSeedDefinition = {
  [ContentType.NOTE]: [{ name: folderNames.NOTE_RECIPES }, { name: folderNames.NOTE_TECH }],
  [ContentType.TODO]: [{ name: folderNames.TODO_PROJECTS, children: [{ name: folderNames.TODO_ARCHIVES }] }],
}

export const notesToSeed: NoteSeedDefinition[] = [
  { name: 'Docker', folderName: folderNames.NOTE_TECH },
  { name: 'GraphQL', folderName: folderNames.NOTE_TECH },
  { name: 'Go', folderName: folderNames.NOTE_TECH },
  { name: 'Svelte', folderName: folderNames.NOTE_TECH },
  {
    name: 'Beef Bourguignon',
    folderName: folderNames.NOTE_RECIPES,
    html: `<h1 id="cl3kbplva00003v6pquy4r8a8">Beef Bourguignon</h1><p>Beef bourguignon, also called beef Burgundy, and bœuf à la Bourguignonne, is a French beef stew braised in red wine, often red Burgundy, and beef stock, typically flavored with carrots, onions, garlic, and a bouquet garni, and garnished with pearl onions, mushrooms, and bacon.</p><img alt="Beef_bourguignon_NYT" crossorigin="anonymous" decoding="async" height="844" sizes="100vw" src="https://res.cloudinary.com/hakudev/image/private/s--EbYxwr-L--/fl_progressive/v1653407020/cl3kbnlik0007cxrlz0ftv8q0/s2pmsb1lgsymdmpekvca" srcset="https://res.cloudinary.com/hakudev/image/private/s--10lEGdvw--/f_webp,w_320/v1653407020/cl3kbnlik0007cxrlz0ftv8q0/s2pmsb1lgsymdmpekvca 320w, https://res.cloudinary.com/hakudev/image/private/s--DIRfFFRm--/f_webp,w_640/v1653407020/cl3kbnlik0007cxrlz0ftv8q0/s2pmsb1lgsymdmpekvca 640w, https://res.cloudinary.com/hakudev/image/private/s--4kCj7muX--/f_webp,w_960/v1653407020/cl3kbnlik0007cxrlz0ftv8q0/s2pmsb1lgsymdmpekvca 960w, https://res.cloudinary.com/hakudev/image/private/s--xiG0t3op--/f_webp,w_1280/v1653407020/cl3kbnlik0007cxrlz0ftv8q0/s2pmsb1lgsymdmpekvca 1280w, https://res.cloudinary.com/hakudev/image/private/s--2JJOOrnZ--/f_webp,w_1500/v1653407020/cl3kbnlik0007cxrlz0ftv8q0/s2pmsb1lgsymdmpekvca 1500w" width="1500" style="background: url(data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAABQBgCdASpkADgAP02Qvla2Mi4jslgMqsApiWkGe9VTQYAACIFmYwjYejJEZvXRLj05UdhD7Qn9yVTKAAD+zwGgbScACkfuCFTEDIKUHGHIuSBduy/NIFTVcgx3MpgnbCct5JYqz9cVmBxq/Rhxce3WBup6sh+75p1vogl5MikV1serZjgW2cIAAAA=) top left / cover no-repeat;"><h2 id="cl3kbvzmf00043v6pgexkdivi">Serving</h2><blockquote><p>Beef bourguignon is generally accompanied with boiled potatoes or pasta.</p></blockquote><h2 id="cl3kbxyxl00053v6pm3r28hcz">Ingredients</h2><ul><li><p>1 tablespoons extra-virgin olive oil</p></li><li><p>6 ounces (170g) bacon, <mark>roughly chopped</mark></p></li><li><p>3 pounds (1 1/2 kg) beef brisket, trimmed of fat (chuck steak or stewing beef) cut into 2-inch chunks</p></li><li><p>1 large carrot sliced 1/2-inch thick</p></li><li><p>1 large white onion, diced</p></li><li><p>6 cloves garlic, minced (divided)</p></li><li><p>1 pinch coarse salt and freshly ground pepper</p></li><li><p>2 tablespoons flour</p></li><li><p><s>12 small pearl onions (optional)</s></p></li><li><p>3 cups red wine like Merlot, Pinot Noir, or a Chianti -- for a milder sauce, use only 2 cups of wine</p></li><li><p>2-3 cups beef stock (if using 2 cups of wine, use 3 cups beef stock)</p></li><li><p>2 tablespoons tomato paste</p></li><li><p>1 beef bullion cube, crushed</p></li><li><p>1 teaspoon fresh thyme, finely chopped</p></li><li><p>2 tablespoons fresh parsley, finely chopped (divided)</p></li><li><p>2 bay leaves</p></li><li><p>1 pound fresh small white or brown mushrooms, quartered</p></li><li><p>2 tablespoons butter</p></li></ul><h2 id="cl3kbykg900063v6pmm4t5qyf">Instructions</h2><ol><li><p>Preheat oven to 350°F (175°C).</p></li><li><p>Heat the oil in a large dutch oven or heavy based pot. Sauté the bacon over medium heat for about 3 minutes, until crisp and browned. Transfer with a slotted spoon to a large dish and set aside.</p></li><li><p>Pat dry beef with paper towel; sear in batches in the hot oil/bacon fat until browned on all sides. Remove to the dish with the bacon.</p></li><li><p>In the remaining oil/bacon fat, sauté the carrots and diced onions until softened, (about 3 minutes), then add 4 cloves minced garlic and cook for 1 minute. Drain excess fat (leave about 1 tablespoon in the pan) and return the bacon and beef back into the pot; season with 1/2 teaspoon coarse salt and 1/4 teaspoon ground pepper. Sprinkle with flour, toss well and cook for 4-5 minutes to brown.</p></li><li><p>Add the pearl onions, wine and enough stock so that the meat is barely covered. Then add the tomato paste, bullion&nbsp;and herbs. Bring to a simmer on the stove.</p></li><li><p>Cover, transfer to lower part of the oven and simmer for 2 to 3 hours, or until the meat is fall apart tender (adjust the heat so that the liquid simmers very slowly).</p></li><li><p><em>In the last 5 minutes of cooking time, prepare your mushrooms:</em>Heat the butter in a medium-sized skillet/pan over heat. When the foam subsides, add the remaining 2 cloves garlic and cook until fragrant (about 30 seconds), then add in the mushrooms. Cook for about 5 minutes, while shaking the pan occasionally to coat with the butter. Season with salt and pepper, if desired. Once they are browned, set aside.</p></li><li><p>Place a colander over a large pot (I do this in my clean kitchen sink). Remove the casserole from the oven and carefully empty its contents into the colander (you want to collect the sauce only). Discard the herbs</p></li><li><p>Return the beef mixture back into the dutch oven or pot. Add the mushrooms over the meat.</p></li><li><p>Remove any fat off the sauce( if any) and simmer for a minute or two, skimming off any additional fat which rises to the surface.</p></li><li><p>You should be left with about 2 1/2 cups of sauce thick enough to coat the back of a spoon lightly.&nbsp;If the sauce is too thick, add a few tablespoons of stock. If the sauce is too thin, boil it over medium heat for about 10 minutes, or until reduced to the right consistency.</p></li><li><p>Taste for seasoning and adjust salt and pepper, if desired. Pour the sauce over the meat and vegetables.</p></li><li><p>If you are serving immediately, simmer the beef bourguignon for 2 to 3 minutes to heat through.Garnish with parsley and serve with mashed potatoes, rice or noodles.</p></li><li><p>To serve the following day, allow the casserole to cool completely, cover and refrigerate.The day of serving, remove from refrigerator for at least an hour before reheating. Place over medium-low heat and let simmer gently for about 10 minutes,&nbsp;basting the meat and vegetables with the sauce.</p></li></ol><h2 id="cl3kbze8400073v6p7baaiu79">Notes</h2><ul><li><p>Let it rest for 15 minutes and the flavours begin to settle into each other.</p></li></ul>`,
    text: `Beef Bourguignon

Beef bourguignon, also called beef Burgundy, and bœuf à la Bourguignonne, is a French beef stew braised in red wine, often red Burgundy, and beef stock, typically flavored with carrots, onions, garlic, and a bouquet garni, and garnished with pearl onions, mushrooms, and bacon.

Serving

Beef bourguignon is generally accompanied with boiled potatoes or pasta.

Ingredients

1 tablespoons extra-virgin olive oil

6 ounces (170g) bacon, roughly chopped

3 pounds (1 1/2 kg) beef brisket, trimmed of fat (chuck steak or stewing beef) cut into 2-inch chunks

1 large carrot sliced 1/2-inch thick

1 large white onion, diced

6 cloves garlic, minced (divided)

1 pinch coarse salt and freshly ground pepper

2 tablespoons flour

12 small pearl onions (optional)

3 cups red wine like Merlot, Pinot Noir, or a Chianti -- for a milder sauce, use only 2 cups of wine

2-3 cups beef stock (if using 2 cups of wine, use 3 cups beef stock)

2 tablespoons tomato paste

1 beef bullion cube, crushed

1 teaspoon fresh thyme, finely chopped

2 tablespoons fresh parsley, finely chopped (divided)

2 bay leaves

1 pound fresh small white or brown mushrooms, quartered

2 tablespoons butter

Instructions

Preheat oven to 350°F (175°C).

Heat the oil in a large dutch oven or heavy based pot. Sauté the bacon over medium heat for about 3 minutes, until crisp and browned. Transfer with a slotted spoon to a large dish and set aside.

Pat dry beef with paper towel; sear in batches in the hot oil/bacon fat until browned on all sides. Remove to the dish with the bacon.

In the remaining oil/bacon fat, sauté the carrots and diced onions until softened, (about 3 minutes), then add 4 cloves minced garlic and cook for 1 minute. Drain excess fat (leave about 1 tablespoon in the pan) and return the bacon and beef back into the pot; season with 1/2 teaspoon coarse salt and 1/4 teaspoon ground pepper. Sprinkle with flour, toss well and cook for 4-5 minutes to brown.

Add the pearl onions, wine and enough stock so that the meat is barely covered. Then add the tomato paste, bullion and herbs. Bring to a simmer on the stove.

Cover, transfer to lower part of the oven and simmer for 2 to 3 hours, or until the meat is fall apart tender (adjust the heat so that the liquid simmers very slowly).

In the last 5 minutes of cooking time, prepare your mushrooms:Heat the butter in a medium-sized skillet/pan over heat. When the foam subsides, add the remaining 2 cloves garlic and cook until fragrant (about 30 seconds), then add in the mushrooms. Cook for about 5 minutes, while shaking the pan occasionally to coat with the butter. Season with salt and pepper, if desired. Once they are browned, set aside.

Place a colander over a large pot (I do this in my clean kitchen sink). Remove the casserole from the oven and carefully empty its contents into the colander (you want to collect the sauce only). Discard the herbs

Return the beef mixture back into the dutch oven or pot. Add the mushrooms over the meat.

Remove any fat off the sauce( if any) and simmer for a minute or two, skimming off any additional fat which rises to the surface.

You should be left with about 2 1/2 cups of sauce thick enough to coat the back of a spoon lightly. If the sauce is too thick, add a few tablespoons of stock. If the sauce is too thin, boil it over medium heat for about 10 minutes, or until reduced to the right consistency.

Taste for seasoning and adjust salt and pepper, if desired. Pour the sauce over the meat and vegetables.

If you are serving immediately, simmer the beef bourguignon for 2 to 3 minutes to heat through.Garnish with parsley and serve with mashed potatoes, rice or noodles.

To serve the following day, allow the casserole to cool completely, cover and refrigerate.The day of serving, remove from refrigerator for at least an hour before reheating. Place over medium-low heat and let simmer gently for about 10 minutes, basting the meat and vegetables with the sauce.

Notes

Let it rest for 15 minutes and the flavours begin to settle into each other.`,
  },
]

export const todosToSeed: TodoSeedDefinition[] = [
  { name: 'toggler-atom', folderName: folderNames.TODO_ARCHIVES },
  { name: 'yata', folderName: folderNames.TODO_PROJECTS },
  { name: 'toggler-vscode', folderName: folderNames.TODO_PROJECTS },
  { name: 'Ideas' },
  {
    name: 'haku',
    folderName: folderNames.TODO_PROJECTS,
    nodes: [
      {
        content: 'Add import feature',
        status: TodoNodeStatus.COMPLETED,
        children: [
          {
            content: 'Dynalist',
            status: TodoNodeStatus.COMPLETED,
            children: [
              { content: 'Parse OPML', status: TodoNodeStatus.COMPLETED },
              {
                content: 'Tests',
                status: TodoNodeStatus.COMPLETED,
                children: [
                  { content: 'Invalid OPML', status: TodoNodeStatus.COMPLETED },
                  { content: 'Empty OPML', status: TodoNodeStatus.COMPLETED },
                  { content: 'Completed todos', status: TodoNodeStatus.COMPLETED },
                  { content: 'Todos with notes', status: TodoNodeStatus.COMPLETED },
                  { content: 'Nested todos', status: TodoNodeStatus.COMPLETED },
                ],
              },
            ],
          },
        ],
      },
      { content: 'Add fireworks', status: TodoNodeStatus.CANCELLED },
      {
        content: 'Add periodic update detection mechanism',
        noteHtml: `<p>Check <a target="_blank" rel="noopener noreferrer nofollow" href="https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update">https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update</a></p><pre><code class="language-javascript">serviceWorkerRegistration.update()</code></pre>`,
        noteText: `Check https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update

serviceWorkerRegistration.update()`,
      },
      { content: 'Deploy' },
      {
        content: 'Release',
        children: [
          { content: 'Add README' },
          { content: 'Add CHANGELOG' },
          { content: 'Add LICENSE' },
          { content: 'Make repo public' },
        ],
      },
    ],
  },
]
