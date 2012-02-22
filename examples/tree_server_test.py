import unittest
from tree_server import *

#mock
class CourseData(Folder):
    def __init__(self):
        self.folder_structure = '{"id":"", "children":[]}';
    
    def initialize_tree(self):
        json = simplejson.loads(self.folder_structure)

        tree = Folder()
        tree.deserialize(json)
        return tree
        
    def save_tree(self, tree):
        json = tree.serialize()
        self.folder_structure = simplejson.dumps(json)
        return self.folder_structure

class TreeSetup(unittest.TestCase):
    def setUp(self):
        self.cd = CourseData()
        self.tree = self.cd.initialize_tree()
    def tearDown(self):
        self.cd = None
        self.tree = None

    #def serialize_deserialize(self):
        #serialized_data = self.tree.serialize()
        #self.tree.deserialize('{"id":"","children":[]}')
        #self.tree.deserialize(serialized_data)

class TestTreeSerialization(TreeSetup):
    def test_init(self):
        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"hidden": false, "constructor": "folder", "children": [], "id": "", "title": ""}')

    def test_deserialized_item(self):
        self.cd.folder_structure = '{"children": [{"children": [], "id": "Folder 2", "constructor": "folder"}, {"children": [{"id": "Item 1", "constructor": "item"}], "id": "Folder 1", "constructor": "folder"}], "id": "", "constructor": "folder"}'
        self.tree = self.cd.initialize_tree()

        self.assertEqual( len(self.tree.children), 2 )
        self.assertEqual( len(self.tree.children[0].children), 0 )
        self.assertEqual( len(self.tree.children[1].children), 1 )


    def test_serialize_folder(self):
        item = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(item)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"hidden": false, "constructor": "folder", "children": [{"hidden": false, "constructor": "folder", "children": [], "id": "Folder 1", "title": "Folder 1"}], "id": "", "title": ""}')

    def test_folder_hidden(self):
        self.cd.folder_structure = '{"children": [{"children": [], "id": "Folder", "hidden": true, "constructor": "folder"}], "id": "", "constructor": "folder"}'
        self.tree = self.cd.initialize_tree()
        self.assertEqual( len(self.tree.children), 1 )
        self.assertTrue( self.tree.children[0].hidden )

        self.tree.children[0].hidden = False
        json_string = self.cd.save_tree( self.tree )
        self.assertEqual( json_string, '{"hidden": false, "constructor": "folder", "children": [{"hidden": false, "constructor": "folder", "children": [], "id": "Folder", "title": "Folder"}], "id": "", "title": ""}')

    def test_serialized_nested_folder(self):
        folder = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(folder)

        item = self.tree.initialize_type("folder", "Folder 2")
        self.tree.add_item(item, at=0)

        item = self.tree.initialize_type("item", "Item 1")
        folder.add_item(item)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"hidden": false, "constructor": "folder", "children": [{"hidden": false, "constructor": "folder", "children": [], "id": "Folder 2", "title": "Folder 2"}, {"hidden": false, "constructor": "folder", "children": [{"id": "Item 1", "constructor": "item"}], "id": "Folder 1", "title": "Folder 1"}], "id": "", "title": ""}')

    def test_serialized_ordered_items(self):
        item = self.tree.initialize_type("item", "Item 1")
        self.tree.add_item(item)

        item = self.tree.initialize_type("item", "Item 2")
        self.tree.add_item(item, at=0)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"hidden": false, "constructor": "folder", "children": [{"id": "Item 2", "constructor": "item"}, {"id": "Item 1", "constructor": "item"}], "id": "", "title": ""}')

    def test_serialize_item(self):
        item = self.tree.initialize_type("item", "Item 1")
        self.tree.add_item(item)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"hidden": false, "constructor": "folder", "children": [{"id": "Item 1", "constructor": "item"}], "id": "", "title": ""}')

class TestFolder(TreeSetup):
    def test_initialize_item(self):
        item = self.tree.initialize_type("folder")
        self.assertIsInstance(item, Folder)

        item = self.tree.initialize_type("item")
        self.assertIsInstance(item, Item)

    def test_initialize_item_title(self):
        item = self.tree.initialize_type("item", "Item 1")
        self.assertEqual(item.id, "Item 1")

        item = self.tree.initialize_type("folder", "Folder 1")
        self.assertEqual(item.id, "Folder 1")

    def test_add_item(self):
        self.assertFalse( len(self.tree.children) )

        item = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(item)        
        
        self.assertEqual( len(self.tree.children), 1 )
        self.assertEqual( self.tree.children[0].id, "Folder 1")

    def test_add_item_at_position(self):
        item = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(item)
        item = self.tree.initialize_type("item", "Item 1")
        self.tree.add_item(item)
        item = self.tree.initialize_type("item", "Item 2")
        self.tree.add_item(item, at=1)
        
        self.assertEqual( len(self.tree.children), 3 )
        self.assertEqual( self.tree.children[1].id, "Item 2")        

    def test_get_item(self):
        folder = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(folder)

        folder2 = self.tree.initialize_type("folder", "Folder 2")
        self.tree.add_item(folder2, at=0)

        item = self.tree.initialize_type("item", "Item 1")
        folder.add_item(item)

        self.assertEqual(self.tree.get_item("Item 1"), item)
        self.assertEqual(self.tree.get_item("Folder 1"), folder)
        self.assertEqual(self.tree.get_item("Folder 2"), folder2)
        self.assertEqual(folder.get_item("Item 1"), item)
    
    def test_add_child_many_times(self):
        folder = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(folder)

        item = self.tree.initialize_type("item", "Item 1")
        folder.add_item(item)
        folder.add_item(item)

        self.assertEqual(folder.length(), 2)
        folder.remove_item(item)
        self.assertEqual(folder.length(), 0)


if __name__ == "__main__":
    unittest.main()



##request methods
#def add_item(cd, type, id, folder_id=None, position=None):
    #tree = cd.initialize_tree()

    #item = tree.initialize_type( type, id )
    #parent_folder = tree.get_item( folder_id ) or tree
    #parent_folder.add_item(item, at=position)

    #cd.save_tree(tree)

#def remove_item(cd, id):
    #tree = cd.initialize_tree()

    #item = tree.get_item(id)
    #for parent in item.parents(tree):
        #parent.remove_item(item)

    #cd.save_tree(tree)

#def move_item(cd, id, old_folder_id, new_folder_id, position):
    #tree = cd.initialize_tree()

    #old_folder = tree.get_item(old_folder_id)
    #new_folder = tree.get_item(new_folder_id)
    #item = old_folder.get_item(id)

    #old_folder.remove_item(item)
    #new_folder.insert_item(item, at=position)

    #cd.save_tree(tree)

#def set_folder_hidden(cd, folder_id, hidden_status):
    #tree = cd.initialize_tree()

    #folder = tree.get_item(folder_id)
    #folder.hidden = hidden_status

    #cd.save_tree(tree)
#class TestTreeBasic(TreeSetup):
    #def test_hidden(self):
        #add_item( self.cd, "folder", "Folder 1" )
        #add_item( self.cd, "folder", "Folder 2" )
        #tree = self.cd.initialize_tree()
        #self.assertFalse( tree.children[0].hidden )

        #set_folder_hidden( self.cd, "Folder 1", True )
        #tree = self.cd.initialize_tree()
        #self.assertTrue( tree.children[0].hidden )
        #self.assertFalse( tree.children[1].hidden )

    #def test_add_item(self):
        #add_item( self.cd, "folder", "Folder 1" )
        #add_item( self.cd, "item", "Item 1", position=0 )
        #add_item( self.cd, "item", "Item 2", "Folder 1" )

        #tree = self.cd.initialize_tree()

        #self.assertEqual( len(tree.children), 2 )
        #self.assertEqual( tree.children[0].id, "Item 1" )
        #self.assertEqual( tree.children[1].children[0].id, "Item 2" )

    #def test_remove_item(self):
        #add_item( self.cd, "folder", "Folder 1" )
        #add_item( self.cd, "item", "Item 1", position=0 )
        #add_item( self.cd, "item", "Item 2", "Folder 1" )

        #tree = self.cd.initialize_tree()
        #self.assertEqual( len(tree.children), 2 )

        #remove_item( self.cd, "Folder 1")

        #tree = self.cd.initialize_tree()
        #self.assertEqual( len(tree.children), 1 )
        #self.assertEqual( tree.children[0].id, "Item 1" )

    #def test_parents(self):
        ##f1
        ##-> item
        ##f2
        ##-> f3
        ##--> item

        #f1 = self.tree.initialize_type("folder", "Folder 1")
        #f2 = self.tree.initialize_type("folder", "Folder 2")
        #f3 = self.tree.initialize_type("folder", "Folder 3")
        #item = self.tree.initialize_type("item", "Item 1")
        #self.tree.add_item(f1)
        #self.tree.add_item(f2)
        #f2.add_item(f3)

        #self.assertEqual( len(item.parents(self.tree)), 0 )

        #f1.add_item(item)
        #self.assertEqual( len(item.parents(self.tree)), 1 )

        #f3.add_item(item)
        #self.assertEqual( len(item.parents(self.tree)), 2 )

        #f3.add_item(item)
        #self.assertEqual( len(item.parents(self.tree)), 2 )

        #self.assertEqual( len(item.parents(f2)), 1 )
        #self.assertEqual( len(item.parents(f1)), 1 )


