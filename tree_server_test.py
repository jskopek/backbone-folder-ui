import unittest
from tree_server import *

class TreeSetup(unittest.TestCase):
    def setUp(self):
        self.cd = CourseData()
        self.tree = self.cd.initialize_tree()
    def tearDown(self):
        self.cd = None
        self.tree = None
        
class TestTreeSerialization(TreeSetup):
    def test_init(self):
        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"children": [], "id": "", "constructor_ref": "FolderConstructorRef"}')

    def test_serialize_folder(self):
        item = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(item)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"children": [{"children": [], "id": "Folder 1", "constructor_ref": "FolderConstructorRef"}], "id": "", "constructor_ref": "FolderConstructorRef"}')

    def test_serialized_nested_folder(self):
        folder = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(folder)

        item = self.tree.initialize_type("folder", "Folder 2")
        self.tree.add_item(item, at=0)

        item = self.tree.initialize_type("item", "Item 1")
        folder.add_item(item)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"children": [{"children": [], "id": "Folder 2", "constructor_ref": "FolderConstructorRef"}, {"children": [{"id": "Item 1", "constructor_ref": "TreeItemConstructorRef"}], "id": "Folder 1", "constructor_ref": "FolderConstructorRef"}], "id": "", "constructor_ref": "FolderConstructorRef"}')

    def test_serialized_ordered_items(self):
        item = self.tree.initialize_type("item", "Item 1")
        self.tree.add_item(item)

        item = self.tree.initialize_type("item", "Item 2")
        self.tree.add_item(item, at=0)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"children": [{"id": "Item 2", "constructor_ref": "TreeItemConstructorRef"}, {"id": "Item 1", "constructor_ref": "TreeItemConstructorRef"}], "id": "", "constructor_ref": "FolderConstructorRef"}')

    def test_serialize_item(self):
        item = self.tree.initialize_type("item", "Item 1")
        self.tree.add_item(item)

        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, '{"children": [{"id": "Item 1", "constructor_ref": "TreeItemConstructorRef"}], "id": "", "constructor_ref": "FolderConstructorRef"}')

class TestTreeDeserialization(TreeSetup):
    def test_deserialized_item(self):
        self.cd.folder_structure = '{"children": [{"children": [], "id": "Folder 2", "constructor_ref": "FolderConstructorRef"}, {"children": [{"id": "Item 1", "constructor_ref": "TreeItemConstructorRef"}], "id": "Folder 1", "constructor_ref": "FolderConstructorRef"}], "id": "", "constructor_ref": "FolderConstructorRef"}'
        self.tree = self.cd.initialize_tree()

        self.assertEqual( len(self.tree.children), 2 )
        self.assertEqual( len(self.tree.children[0].children), 0 )
        self.assertEqual( len(self.tree.children[1].children), 1 )

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

# class TestMajorMethods(self):
#     def test_new_item(self):
#         
#         add_item( self.cd, "folder", "Folder 1")
#         self.assertEqual( self, 

if __name__ == "__main__":
    unittest.main()
