  extend = (root, objects...) ->
    for object in objects
      root = ko.utils.extend(root, object)
    return root
