/* Shared namespace. Loaded first so data files and feature modules can register themselves. */
window.BW=window.BW||{};
BW.views=BW.views||{};     // route name -> function returning HTML
BW.actions=BW.actions||{}; // data-a="name" click handlers
BW.bind=BW.bind||{};       // data-bind="name" input handlers
BW.leave=BW.leave||[];     // called when the route changes
BW.after=BW.after||[];     // called after every render
